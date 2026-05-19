// supabase/functions/_templates/CoachCommentEmail.tsx
// Reserved for future email expansion of coach comment notifications.
// Currently coach comment notifications are in-app only.
import React from 'https://esm.sh/react@18'
import { Text, Button } from 'https://esm.sh/@react-email/components@0.0.19'
import { BaseEmail } from './BaseEmail.tsx'

export interface CoachCommentEmailProps {
  coachName: string;
  notePreview: string;
  dealershipName: string;
  dashboardUrl: string;
}

export function CoachCommentEmail({ coachName, notePreview, dealershipName, dashboardUrl }: CoachCommentEmailProps) {
  return (
    <BaseEmail previewText={`New coach note from ${coachName}`}>
      <Text style={{ margin: '0 0 12px', color: '#172d4d', fontSize: '18px', fontWeight: 600 }}>
        New note from your coach
      </Text>
      <Text style={{ margin: '0 0 16px', color: '#445166', fontSize: '14px', lineHeight: '1.6' }}>
        <strong>{coachName}</strong> added a note for <strong>{dealershipName}</strong>:
      </Text>
      <Text style={{
        margin: '0 0 24px', color: '#44546F', fontSize: '13px', lineHeight: '1.6',
        borderLeft: '3px solid #1D7AFC', paddingLeft: '12px', fontStyle: 'italic',
      }}>
        "{notePreview}"
      </Text>
      <Button href={dashboardUrl} style={{ backgroundColor: '#1D7AFC', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: 600, padding: '12px 28px', textDecoration: 'none' }}>
        View Dashboard
      </Button>
    </BaseEmail>
  )
}
