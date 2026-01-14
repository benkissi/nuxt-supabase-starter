import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Row,
  Column,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface MagicLinkEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
}

export const MagicLinkEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
}: MagicLinkEmailProps) => {
  const magicLink = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`
  
  return (
    <Html>
      <Head />
      <Preview>Log in to Topokata with this magic link</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with gradient */}
          <Section style={headerSection}>
            <Section style={iconCircle}>
              <Text style={{ margin: 0, textAlign: 'center' as const }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Text>
            </Section>
            <Heading style={headerTitle}>Welcome Back!</Heading>
            <Text style={headerSubtitle}>Log in to your Topokata account</Text>
          </Section>

          {/* Content */}
          <Section style={contentSection}>
            {/* Info Box */}
            <Section style={infoBox}>
              <Text style={infoText}>
                Click the button below to securely log in to your account. This link will expire in a few minutes for your security.
              </Text>
            </Section>

            <Text style={greetingText}>
              Hi there! 👋
            </Text>

            <Text style={bodyText}>
              You requested a magic link to sign in to your Topokata account. This is a secure, passwordless way to access your account.
            </Text>

            <Text style={bodyText}>
              Click the button below to complete your login:
            </Text>

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Link href={magicLink} style={buttonLink}>
                Log In to Topokata →
              </Link>
            </Section>

            {/* Benefits Section */}
            <Section style={benefitsSection}>
              <Text style={benefitsTitle}>
                What you can do with Topokata:
              </Text>
              <ul style={benefitsList}>
                <li style={benefitsItem}>Create powerful geo-spatial forms</li>
                <li style={benefitsItem}>Collect location-aware data</li>
                <li style={benefitsItem}>Export data in multiple formats</li>
                <li style={benefitsItem}>Collaborate with your team</li>
              </ul>
            </Section>

            {/* Warning Box */}
            <Section style={warningBox}>
              <Text style={warningText}>
                🔒 <strong>Security Note:</strong> This magic link will expire soon. If you didn&apos;t request this login, you can safely ignore this email.
              </Text>
            </Section>

            {/* Fallback Link */}
            <Section style={fallbackSection}>
              <Text style={fallbackLabel}>
                If the button doesn&apos;t work, copy and paste this link into your browser:
              </Text>
              <Text style={fallbackLink}>
                {magicLink}
              </Text>
            </Section>

            {/* Alternative: Code */}
            <Section style={codeSection}>
              <Text style={codeLabel}>
                Or, use this temporary login code:
              </Text>
              <code style={codeStyle}>{token}</code>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerTitle}>
              Welcome to Topokata!
            </Text>
            <Text style={footerText}>
              If you weren&apos;t expecting this email, you can safely ignore it.
            </Text>
          </Section>
        </Container>

        {/* Footer Note */}
        <Text style={footerNote}>
          This is an automated message from Topokata. Please do not reply to this email.
        </Text>
      </Body>
    </Html>
  )
}

export default MagicLinkEmail

const main = {
  margin: 0,
  padding: 0,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  backgroundColor: '#f0fdf4',
  color: '#14532d',
}

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '40px 20px',
}

const headerSection = {
  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  padding: '48px 30px',
  textAlign: 'center' as const,
  borderRadius: '12px 12px 0 0',
}

const iconCircle = {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  margin: '0 auto 20px',
  padding: '20px',
  textAlign: 'center' as const,
}

const headerTitle = {
  margin: '0',
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '700',
  letterSpacing: '-0.5px',
  lineHeight: '1.2',
}

const headerSubtitle = {
  margin: '12px 0 0',
  color: '#d1fae5',
  fontSize: '16px',
  lineHeight: '1.5',
}

const contentSection = {
  backgroundColor: '#ffffff',
  padding: '40px 30px',
  border: '2px solid #86efac',
  borderTop: 'none',
  borderBottom: 'none',
}

const infoBox = {
  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
  borderLeft: '4px solid #10b981',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '30px',
}

const infoText = {
  margin: '0',
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#065f46',
}

const greetingText = {
  margin: '0 0 24px',
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
}

const bodyText = {
  margin: '0 0 24px',
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const buttonLink = {
  display: 'inline-block',
  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  color: '#ffffff',
  textDecoration: 'none',
  padding: '16px 40px',
  borderRadius: '8px',
  fontWeight: '600',
  fontSize: '16px',
  boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)',
}

const benefitsSection = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0',
}

const benefitsTitle = {
  margin: '0 0 16px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#047857',
}

const benefitsList = {
  margin: '0',
  paddingLeft: '20px',
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.8',
}

const benefitsItem = {
  marginBottom: '8px',
}

const warningBox = {
  backgroundColor: '#fef3c7',
  borderLeft: '4px solid #f59e0b',
  padding: '16px',
  borderRadius: '8px',
  margin: '24px 0',
}

const warningText = {
  margin: '0',
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#92400e',
}

const fallbackSection = {
  marginTop: '32px',
  paddingTop: '24px',
  borderTop: '1px solid #e5e7eb',
}

const fallbackLabel = {
  margin: '0 0 12px',
  fontSize: '13px',
  lineHeight: '1.6',
  color: '#6b7280',
}

const fallbackLink = {
  margin: '0',
  wordBreak: 'break-all' as const,
  fontSize: '12px',
  color: '#10b981',
  backgroundColor: '#f0fdf4',
  padding: '12px',
  borderRadius: '6px',
  fontFamily: 'monospace',
}

const codeSection = {
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid #e5e7eb',
}

const codeLabel = {
  margin: '0 0 12px',
  fontSize: '13px',
  lineHeight: '1.6',
  color: '#6b7280',
}

const codeStyle = {
  display: 'inline-block',
  padding: '16px',
  width: '100%',
  backgroundColor: '#f4f4f4',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
  color: '#333',
  fontSize: '14px',
  fontFamily: 'monospace',
  textAlign: 'center' as const,
  boxSizing: 'border-box' as const,
}

const footerSection = {
  background: 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)',
  padding: '24px 30px',
  borderTop: '2px solid #86efac',
  borderBottom: '2px solid #86efac',
  borderRadius: '0 0 12px 12px',
}

const footerTitle = {
  margin: '0 0 8px',
  fontSize: '13px',
  color: '#047857',
  textAlign: 'center' as const,
  fontWeight: '500',
}

const footerText = {
  margin: '0',
  fontSize: '12px',
  color: '#6b7280',
  textAlign: 'center' as const,
}

const footerNote = {
  margin: '24px 0 0',
  fontSize: '11px',
  color: '#9ca3af',
  textAlign: 'center' as const,
}
