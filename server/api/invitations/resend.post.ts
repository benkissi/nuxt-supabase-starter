import { serverSupabaseClient } from "#supabase/server";
import { sendInvitationEmail } from "../../utils/email/resend";

export default defineEventHandler(async (event) => {
    try {
        // Parse and validate request body
        const body = await readBody(event);

        // Validate request
        if (!body.invitation_id) {
            throw createError({
                statusCode: 400,
                message: "Invitation ID is required",
            });
        }

        const { invitation_id } = body;

        // Get authenticated user
        const supabaseClient = await serverSupabaseClient(event);
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
            throw createError({
                statusCode: 401,
                message: "Unauthorized: User not authenticated",
            });
        }

        // Get invitation details
        const { data: invitation, error: inviteError } = await supabaseClient
            .from("invitations")
            .select(`
                *,
                organization:organizations(id, name)
            `)
            .eq("id", invitation_id)
            .single();

        if (inviteError || !invitation) {
            throw createError({
                statusCode: 404,
                message: "Invitation not found",
            });
        }

        // Check if user is admin or owner of the organization
        const { data: memberCheck } = await supabaseClient
            .from("organization_members")
            .select("role")
            .eq("organization_id", invitation.organization_id)
            .eq("user_id", user.id)
            .single();

        if (!memberCheck || !["owner", "admin"].includes(memberCheck.role)) {
            throw createError({
                statusCode: 403,
                message:
                    "Forbidden: User does not have permission to resend invitations",
            });
        }

        // Check if invitation is still valid
        if (invitation.status !== "pending") {
            throw createError({
                statusCode: 400,
                message: `Cannot resend invitation with status: ${invitation.status}`,
            });
        }

        if (new Date(invitation.expires_at) < new Date()) {
            throw createError({
                statusCode: 400,
                message: "Invitation has expired",
            });
        }

        // Get organization details
        const organization = invitation.organization as { name: string } | null;
        if (!organization) {
            throw createError({
                statusCode: 404,
                message: "Organization not found",
            });
        }

        // Get inviter's name from accounts table
        const { data: inviterAccount } = await supabaseClient
            .from("accounts")
            .select("name")
            .eq("user_id", invitation.invited_by)
            .single();

        const inviterName = inviterAccount?.name || user.email || "A team member";

        // Generate invitation link
        const config = useRuntimeConfig();
        // Use appUrl from env, or site URL, or fallback to localhost
        const appUrl = config.public.appUrl || 
            config.site?.url || 
            "http://localhost:3000";
        const invitationLink = `${appUrl}/invite?token=${invitation.token}`;

        // Send invitation email
        const emailResult = await sendInvitationEmail({
            to: invitation.email,
            organizationName: organization.name,
            inviterName,
            inviteeName: invitation.name || undefined,
            role: invitation.role,
            invitationLink,
            expiresAt: invitation.expires_at,
        });

        if (!emailResult.success) {
            // Log the error but don't fail the request
            console.error(
                "Failed to resend invitation email:",
                emailResult.error,
            );
            throw createError({
                statusCode: 500,
                message: emailResult.error || "Failed to resend email",
            });
        }

        return {
            success: true,
            message: "Invitation email resent successfully",
            email_sent: true,
            messageId: emailResult.messageId,
        };
    } catch (error: any) {
        // If it's already a createError, rethrow it
        if (error.statusCode) {
            throw error;
        }

        // Generic error
        console.error("Error in resend invitation route:", error);
        throw createError({
            statusCode: 500,
            message: "Internal server error",
        });
    }
});
