import {
    getInvitationEmailHtml,
    getInvitationEmailText,
} from "./templates/invitation";

interface SendInvitationEmailParams {
    to: string;
    organizationName: string;
    inviterName: string;
    inviteeName?: string;
    role: string;
    invitationLink: string;
    expiresAt: string;
}

/**
 * Send an invitation email using Resend API
 */
export async function sendInvitationEmail(
    params: SendInvitationEmailParams,
): Promise<{ success: boolean; error?: string; messageId?: string }> {
    const config = useRuntimeConfig();
    const resendApiKey = config.resendApiKey;
    const resendDomain = config.resendDomain || "mail.topokata.com";

    if (!resendApiKey) {
        console.error("Resend API key not configured");
        return {
            success: false,
            error: "Email service not configured",
        };
    }

    const emailData = {
        organizationName: params.organizationName,
        inviterName: params.inviterName,
        inviteeEmail: params.to,
        inviteeName: params.inviteeName || "",
        role: params.role,
        invitationLink: params.invitationLink,
        expiresAt: params.expiresAt,
    };

    const htmlContent = getInvitationEmailHtml(emailData);
    const textContent = getInvitationEmailText(emailData);

    try {
        const response = await $fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
            },
            body: {
                from: `Topokata <no-reply@${resendDomain}>`,
                to: params.to,
                subject:
                    `You've been invited to join ${params.organizationName}`,
                html: htmlContent,
                text: textContent,
            },
        });

        return {
            success: true,
            messageId: (response as any).id,
        };
    } catch (error: any) {
        console.error("Failed to send invitation email:", error);
        return {
            success: false,
            error: error.message || "Failed to send email",
        };
    }
}
