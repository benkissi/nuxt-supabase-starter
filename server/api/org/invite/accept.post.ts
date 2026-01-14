import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { invitationId, token } = body;

        if (!invitationId || !token) {
            throw createError({
                statusCode: 400,
                message: 'Invitation ID and token are required',
            });
        }

        // Get authenticated user
        const supabaseClient = await serverSupabaseClient(event);
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            throw createError({
                statusCode: 401,
                message: 'User not authenticated',
            });
        }

        // Use service role for database operations
        const supabase = serverSupabaseServiceRole(event);

        // Fetch invitation to verify
        const { data: invitation, error: inviteError } = await supabase
            .from('invitations')
            .select('*')
            .eq('id', invitationId)
            .eq('token', token)
            .maybeSingle();

        if (inviteError) {
            console.error('Error fetching invitation:', inviteError);
            throw createError({
                statusCode: 500,
                message: 'Failed to verify invitation',
            });
        }

        if (!invitation) {
            throw createError({
                statusCode: 404,
                message: 'Invitation not found',
            });
        }

        // Verify invitation is still valid
        if (invitation.status !== 'pending') {
            throw createError({
                statusCode: 400,
                message: 'This invitation has already been used',
            });
        }

        if (new Date(invitation.expires_at) < new Date()) {
            throw createError({
                statusCode: 400,
                message: 'This invitation has expired',
            });
        }

        // Verify email matches
        if (user.email !== invitation.email) {
            throw createError({
                statusCode: 403,
                message: `This invitation was sent to ${invitation.email}. Please log in with that email address.`,
            });
        }

        // Get user's account
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (accountError) {
            console.error('Error fetching account:', accountError);
            throw createError({
                statusCode: 500,
                message: 'Failed to fetch user account',
            });
        }

        if (!account) {
            throw createError({
                statusCode: 500,
                message: 'User account not found. Please contact support.',
            });
        }

        // Check if user is already a member
        const { data: existingMember } = await supabase
            .from('organization_members')
            .select('id')
            .eq('user_id', user.id)
            .eq('organization_id', invitation.organization_id)
            .maybeSingle();

        if (existingMember) {
            // Update invitation status but user is already a member
            await supabase
                .from('invitations')
                .update({ status: 'accepted' })
                .eq('id', invitationId);

            return {
                success: true,
                alreadyMember: true,
                message: 'You are already a member of this organization',
                organizationId: invitation.organization_id,
            };
        }

        // Update invitation status to accepted
        const { error: updateError } = await supabase
            .from('invitations')
            .update({ status: 'accepted' })
            .eq('id', invitationId);

        if (updateError) {
            console.error('Error updating invitation:', updateError);
            throw createError({
                statusCode: 500,
                message: 'Failed to accept invitation',
            });
        }

        // Get account name for fallback
        const { data: accountWithName } = await supabase
            .from('accounts')
            .select('name')
            .eq('id', account.id)
            .single();

        // Add user to organization_members
        const { error: memberError } = await supabase
            .from('organization_members')
            .insert({
                organization_id: invitation.organization_id,
                user_id: user.id,
                account_id: account.id,
                role: invitation.role,
                email: user.email,
                name: invitation.name || accountWithName?.name || user.email || null,
            });

        if (memberError) {
            console.error('Error adding member:', memberError);
            throw createError({
                statusCode: 500,
                message: 'Failed to join organization',
            });
        }

        return {
            success: true,
            alreadyMember: false,
            organizationId: invitation.organization_id,
        };
    } catch (error: unknown) {
        // If it's already a createError, rethrow it
        if (error && typeof error === "object" && "statusCode" in error) {
            throw error;
        }

        // Generic error
        console.error('Error accepting invitation:', error);
        throw createError({
            statusCode: 500,
            message: 'Internal server error',
        });
    }
});
