import { serverSupabaseClient } from "#supabase/server";
import { sendInvitationEmail } from "../../../utils/email/resend";

export default defineEventHandler(async (event) => {
    try {
        // Parse and validate request body
        const body = await readBody(event);

        // Simple validation
        if (!body.email || !body.organization_id) {
            throw createError({
                statusCode: 400,
                message: "Email and organization ID are required",
            });
        }

        const { email, organization_id, role = "member", name } = body;

        // Get authenticated user
        const supabaseClient = await serverSupabaseClient(event);
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
            throw createError({
                statusCode: 401,
                message: "Unauthorized: User not authenticated",
            });
        }

        // Check if user is owner or admin of the organization
        const { data: memberCheck } = await supabaseClient
            .from("organization_members")
            .select("role")
            .eq("organization_id", organization_id)
            .eq("user_id", user.id)
            .single();

        if (!memberCheck || !["owner", "admin"].includes(memberCheck.role)) {
            throw createError({
                statusCode: 403,
                message:
                    "Forbidden: User does not have permission to invite members",
            });
        }

        // Get inviter's name
        const { data: inviterData } = await supabaseClient
            .from("accounts")
            .select("name")
            .eq("user_id", user.id)
            .single();

        const inviterName = inviterData?.name || user.email || "A team member";

        // Check if invitation already exists for this email
        const { data: existingInvite } = await supabaseClient
            .from("invitations")
            .select("id, status")
            .eq("organization_id", organization_id)
            .eq("email", email)
            .single();

        // If there's a pending invitation, return error
        if (existingInvite && existingInvite.status === "pending") {
            throw createError({
                statusCode: 409,
                message:
                    "An invitation has already been sent to this email address",
            });
        }

        // If there's an old invitation (accepted/expired/revoked), delete it
        if (existingInvite) {
            await supabaseClient
                .from("invitations")
                .delete()
                .eq("id", existingInvite.id);
        }

        // Create invitation record (RLS will enforce permissions)
        const { data: invitation, error: inviteError } = await supabaseClient
            .from("invitations")
            .insert({
                organization_id,
                email,
                name: name || null,
                role,
                invited_by: user.id,
            })
            .select()
            .single();

        if (inviteError) {
            console.error("Error creating invitation:", inviteError);
            throw createError({
                statusCode: 500,
                message: "Failed to create invitation",
            });
        }

        // Get organization details
        const { data: organization, error: orgError } = await supabaseClient
            .from("organizations")
            .select("name")
            .eq("id", organization_id)
            .single();

        if (orgError || !organization) {
            throw createError({
                statusCode: 404,
                message: "Organization not found",
            });
        }

        // Generate invitation link
        const config = useRuntimeConfig();
        // Use appUrl from env, or site URL, or fallback to localhost
        const appUrl = config.public.appUrl || 
            config.site?.url || 
            "http://localhost:3000";
        const invitationLink = `${appUrl}/invite?token=${invitation.token}`;

        // Send invitation email
        const emailResult = await sendInvitationEmail({
            to: email,
            organizationName: organization.name,
            inviterName,
            inviteeName: name || undefined,
            role,
            invitationLink,
            expiresAt: invitation.expires_at,
        });

        if (!emailResult.success) {
            // Log the error but don't fail the request
            // The invitation is created, user can still manually share the link
            console.error(
                "Failed to send invitation email:",
                emailResult.error,
            );
            console.error("Invitation created but email failed. Invitation link:", invitationLink);
        } else {
            console.log("Invitation email sent successfully:", emailResult.messageId);
        }

        return {
            success: true,
            invitation: {
                id: invitation.id,
                email: invitation.email,
                role: invitation.role,
                status: invitation.status,
                expires_at: invitation.expires_at,
                invitation_link: invitationLink,
            },
            email_sent: emailResult.success,
        };
    } catch (error: any) {
        // If it's already a createError, rethrow it
        if (error.statusCode) {
            throw error;
        }

        // Handle Zod validation errors
        if (error.name === "ZodError") {
            throw createError({
                statusCode: 400,
                message: "Invalid request data",
                data: error.errors,
            });
        }

        // Generic error
        console.error("Error in email invitation route:", error);
        throw createError({
            statusCode: 500,
            message: "Internal server error",
        });
    }
});
