import { serverSupabaseServiceRole } from '#supabase/server';

export default defineEventHandler(async (event) => {
    try {
        const token = getRouterParam(event, 'token');

        if (!token) {
            throw createError({
                statusCode: 400,
                message: 'Token is required',
            });
        }

        // Use service role to bypass RLS policies
        const supabase = serverSupabaseServiceRole(event);

        // Fetch invitation by token
        const { data: invitation, error: inviteError } = await supabase
            .from('invitations')
            .select('*')
            .eq('token', token)
            .maybeSingle();

        if (inviteError) {
            console.error('Error fetching invitation:', inviteError);
            throw createError({
                statusCode: 500,
                message: 'Failed to fetch invitation',
            });
        }

        if (!invitation) {
            throw createError({
                statusCode: 404,
                message: 'Invitation not found',
            });
        }

        // Check if invitation is expired
        if (new Date(invitation.expires_at) < new Date()) {
            return {
                success: false,
                error: 'expired',
                message: 'This invitation has expired',
            };
        }

        // Check if invitation is not pending
        if (invitation.status !== 'pending') {
            return {
                success: false,
                error: 'already_used',
                message: 'This invitation has already been used',
            };
        }

        // Fetch organization details
        const { data: organization, error: orgError } = await supabase
            .from('organizations')
            .select('id, name, description, image')
            .eq('id', invitation.organization_id)
            .maybeSingle();

        if (orgError) {
            console.error('Error fetching organization:', orgError);
            throw createError({
                statusCode: 500,
                message: 'Failed to fetch organization',
            });
        }

        if (!organization) {
            throw createError({
                statusCode: 404,
                message: 'Organization not found',
            });
        }

        // Return sanitized data
        return {
            success: true,
            invitation: {
                id: invitation.id,
                name: invitation.name,
                email: invitation.email,
                role: invitation.role,
                status: invitation.status,
                expires_at: invitation.expires_at,
                organization_id: invitation.organization_id,
            },
            organization: {
                id: organization.id,
                name: organization.name,
                description: organization.description,
                image: organization.image,
            },
        };
    } catch (error: unknown) {
        // If it's already a createError, rethrow it
        if (error && typeof error === "object" && "statusCode" in error) {
            throw error;
        }

        // Generic error
        console.error('Error in invitation lookup route:', error);
        throw createError({
            statusCode: 500,
            message: 'Internal server error',
        });
    }
});
