// supabase/functions/_templates/StaleActionEmail.tsx
import React from 'https://esm.sh/react@18'
import { Section, Text, Button, Hr } from 'https://esm.sh/@react-email/components@0.0.19'
import { BaseEmail } from './BaseEmail.tsx'

export interface StaleActionEmailProps {
  actionTitle: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  daysStale: number;
  actionsUrl: string;
  markInProgressUrl?: string;
  markCompleteUrl?: string;
}

const priorityColor: Record<string, string> = {
  critical: '#dc2626',
  high: '#d97706',
  medium: '#2563eb',
  low: '#6b7280',
}

export function StaleActionEmail({
  actionTitle,
  priority,
  daysStale,
  actionsUrl,
  markInProgressUrl,
  markCompleteUrl,
}: StaleActionEmailProps) {
  const color = priorityColor[priority] ?? '#6b7280'
  const daysLabel = `${daysStale} day${daysStale === 1 ? '' : 's'}`

  return (
    <BaseEmail previewText={`Action overdue: ${actionTitle} — ${daysLabel} without update`}>
      <Text style={heading}>Action needs attention</Text>
      <Text style={bodyText}>
        <strong>{actionTitle}</strong> has had no update for{' '}
        <strong>{daysLabel}</strong>.
      </Text>
      <Section style={{ marginBottom: '20px' }}>
        <span style={{
          background: `${color}18`, color, border: `1px solid ${color}30`,
          borderRadius: '4px', padding: '3px 10px',
          fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
        }}>
          {priority} priority
        </span>
      </Section>
      <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0' }} />
      {(markInProgressUrl || markCompleteUrl) && (
        <>
          <Text style={{ ...bodyText, marginBottom: '12px' }}>
            Update status without logging in:
          </Text>
          <Section style={{ marginBottom: '20px' }}>
            {markInProgressUrl && (
              <Button href={markInProgressUrl} style={btnSecondary}>Mark In Progress</Button>
            )}
            {markCompleteUrl && (
              <Button href={markCompleteUrl} style={{ ...btnPrimary, marginLeft: '8px' }}>Mark Complete</Button>
            )}
          </Section>
          <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0' }} />
        </>
      )}
      <Button href={actionsUrl} style={btnPrimary}>View Action Plan</Button>
    </BaseEmail>
  )
}

const heading: React.CSSProperties = { margin: '0 0 12px', color: '#172d4d', fontSize: '18px', fontWeight: 600 }
const bodyText: React.CSSProperties = { margin: '0 0 16px', color: '#445166', fontSize: '14px', lineHeight: '1.6' }
const btnPrimary: React.CSSProperties = {
  backgroundColor: '#1D7AFC', borderRadius: '8px', color: '#ffffff',
  fontSize: '14px', fontWeight: 600, padding: '12px 28px',
  textDecoration: 'none', display: 'inline-block',
}
const btnSecondary: React.CSSProperties = { ...btnPrimary, backgroundColor: '#f0f1f3', color: '#172d4d' }
