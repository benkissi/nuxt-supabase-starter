interface InvitationEmailData {
    organizationName: string;
    inviterName: string;
    inviteeName?: string;
    inviteeEmail: string;
    role: string;
    invitationLink: string;
    expiresAt: string;
}

export function getInvitationEmailHtml(data: InvitationEmailData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to join ${data.organizationName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0fdf4; color: #14532d;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; border: 2px solid #86efac;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 48px 30px; text-align: center;">
        <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; margin: 20px auto;">
            <path d="M20 12.5V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V17C4 18.1046 4.89543 19 6 19H13" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <path d="M4 7L12 12L20 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="17" cy="17" r="3" fill="white"/>
            <path d="M16 17L16.75 17.75L18.5 16" stroke="#059669" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
          You've Been Invited!
        </h1>
        <p style="margin: 12px 0 0; color: #d1fae5; font-size: 16px;">
          Join your team
        </p>
      </div>
      
      <!-- Content -->
      <div style="padding: 40px 30px;">
        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #065f46;">
            <strong style="color: #047857;">${data.inviterName}</strong> has invited you to join <strong style="color: #047857;">${data.organizationName}</strong> as a <strong style="color: #047857;">${data.role}</strong>.
          </p>
        </div>
        
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
          Hi${data.inviteeName ? ` ${data.inviteeName}` : " there"}! 👋
        </p>
        
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
          Great news! You've been invited to collaborate with the team.
        </p>
        
        <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #374151;">
          Click the button below to accept your invitation and get started:
        </p>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.invitationLink}" 
             style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.3);">
            Accept Invitation →
          </a>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400e;">
            ⏰ <strong>Important:</strong> This invitation will expire on <strong>${
        new Date(data.expiresAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }</strong>. Make sure to accept it before then!
          </p>
        </div>
        
        <!-- Fallback Link -->
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 12px; font-size: 13px; line-height: 1.6; color: #6b7280;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="margin: 0; word-break: break-all; font-size: 12px; color: #10b981; background-color: #f0fdf4; padding: 12px; border-radius: 6px; font-family: monospace;">
            ${data.invitationLink}
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%); padding: 24px 30px; border-top: 2px solid #86efac;">
        <p style="margin: 0 0 8px; font-size: 13px; color: #047857; text-align: center; font-weight: 500;">
          Welcome to the team!
        </p>
        <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
          If you weren't expecting this invitation, you can safely ignore this email.
        </p>
      </div>
    </div>
    
    <!-- Footer Note -->
    <p style="margin: 24px 0 0; font-size: 11px; color: #9ca3af; text-align: center;">
      This is an automated message. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
  `.trim();
}

export function getInvitationEmailText(data: InvitationEmailData): string {
    const greeting = data.inviteeName ? `Hi ${data.inviteeName}!` : "Hi there!";
    return `
You've been invited to join ${data.organizationName}

${greeting} 👋

${data.inviterName} has invited you to join ${data.organizationName} as a ${data.role}.

Great news! You've been invited to collaborate with the team.

Accept your invitation by visiting this link:
${data.invitationLink}

⏰ IMPORTANT: This invitation will expire on ${
        new Date(data.expiresAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }. Make sure to accept it before then!

If you weren't expecting this invitation, you can safely ignore this email.

---
This is an automated message. Please do not reply to this email.
  `.trim();
}
