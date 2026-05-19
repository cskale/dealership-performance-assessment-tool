// supabase/functions/_templates/BaseEmail.tsx
import React from 'https://esm.sh/react@18'
import {
  Html, Head, Body, Container, Section, Text,
} from 'https://esm.sh/@react-email/components@0.0.19'

export interface BaseEmailProps {
  previewText?: string;
  children: React.ReactNode;
}

export function BaseEmail({ previewText, children }: BaseEmailProps) {
  const siteUrl = typeof Deno !== 'undefined' ? (Deno.env.get('SITE_URL') ?? '') : ''
  return (
    <Html lang="en">
      <Head />
      <Body style={body}>
        {previewText && (
          <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
            {previewText}
          </div>
        )}
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTitle}>Dealer Diagnostic Platform</Text>
          </Section>
          <Section style={content}>
            {children}
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              Manage notification preferences in{' '}
              <a href={`${siteUrl}/app/account`} style={footerLink}>
                Account Settings
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily: "'Inter', Arial, sans-serif",
  margin: 0,
  padding: 0,
}
const container: React.CSSProperties = { maxWidth: '600px', margin: '40px auto' }
const header: React.CSSProperties = {
  backgroundColor: '#1D7AFC',
  borderRadius: '12px 12px 0 0',
  padding: '28px 40px',
  textAlign: 'center',
}
const headerTitle: React.CSSProperties = { margin: 0, color: '#ffffff', fontSize: '20px', fontWeight: 700 }
const content: React.CSSProperties = {
  backgroundColor: '#f8f9fa',
  padding: '40px',
  borderLeft: '1px solid #e0e0e0',
  borderRight: '1px solid #e0e0e0',
}
const footer: React.CSSProperties = {
  backgroundColor: '#f0f1f3',
  borderRadius: '0 0 12px 12px',
  padding: '20px 40px',
  textAlign: 'center',
  border: '1px solid #e0e0e0',
}
const footerText: React.CSSProperties = { margin: 0, color: '#8993A4', fontSize: '12px' }
const footerLink: React.CSSProperties = { color: '#1D7AFC', textDecoration: 'none' }
