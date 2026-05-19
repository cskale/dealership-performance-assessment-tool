// supabase/functions/_templates/WeeklyDigestEmail.tsx
import React from 'https://esm.sh/react@18'
import { Section, Text, Button, Row, Column, Hr } from 'https://esm.sh/@react-email/components@0.0.19'
import { BaseEmail } from './BaseEmail.tsx'

export interface DigestAction {
  action_title: string;
  priority: string;
  urgency_score: number | null;
  days_overdue: number;
}

export interface WeeklyDigestEmailProps {
  openCount: number;
  overdueCount: number;
  topActions: DigestAction[];
  actionsUrl: string;
}

const priorityColor: Record<string, string> = {
  critical: '#dc2626', high: '#d97706', medium: '#2563eb', low: '#6b7280',
}

export function WeeklyDigestEmail({ openCount, overdueCount, topActions, actionsUrl }: WeeklyDigestEmailProps) {
  return (
    <BaseEmail previewText={`${openCount} open actions, ${overdueCount} overdue — weekly digest`}>
      <Text style={heading}>Your weekly action summary</Text>
      <Row style={{ marginBottom: '24px' }}>
        <Column style={statCell}>
          <Text style={statNum}>{openCount}</Text>
          <Text style={statLabel}>Open actions</Text>
        </Column>
        <Column style={{ width: '8px' }} />
        <Column style={{
          ...statCell,
          backgroundColor: overdueCount > 0 ? '#fef2f2' : '#f0fdf4',
          borderColor: overdueCount > 0 ? '#fecaca' : '#bbf7d0',
        }}>
          <Text style={{ ...statNum, color: overdueCount > 0 ? '#dc2626' : '#16a34a' }}>
            {overdueCount}
          </Text>
          <Text style={statLabel}>Overdue</Text>
        </Column>
      </Row>
      {topActions.length > 0 && (
        <>
          <Text style={subheading}>Top priority actions</Text>
          {topActions.map((action, i) => {
            const col = priorityColor[action.priority.toLowerCase()] ?? '#6b7280'
            return (
              <Row key={i} style={{ borderBottom: '1px solid #e5e7eb', padding: '10px 0' }}>
                <Column style={{ flex: 1 }}>
                  <Text style={{ margin: 0, fontSize: '13px', color: '#172d4d' }}>{action.action_title}</Text>
                </Column>
                <Column style={{ width: '80px', textAlign: 'center' }}>
                  <span style={{
                    background: `${col}18`, color: col, border: `1px solid ${col}30`,
                    borderRadius: '4px', padding: '2px 8px',
                    fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                  }}>
                    {action.priority}
                  </span>
                </Column>
                <Column style={{ width: '80px', textAlign: 'right' }}>
                  <Text style={{ margin: 0, fontSize: '12px', color: action.days_overdue > 0 ? '#dc2626' : '#16a34a', fontWeight: action.days_overdue > 0 ? 600 : 400 }}>
                    {action.days_overdue > 0 ? `${action.days_overdue}d overdue` : 'On track'}
                  </Text>
                </Column>
              </Row>
            )
          })}
          <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0' }} />
        </>
      )}
      <Button href={actionsUrl} style={btn}>Review Action Plan</Button>
    </BaseEmail>
  )
}

const heading: React.CSSProperties = { margin: '0 0 20px', color: '#172d4d', fontSize: '18px', fontWeight: 600 }
const subheading: React.CSSProperties = { margin: '0 0 8px', color: '#172d4d', fontSize: '13px', fontWeight: 600 }
const statCell: React.CSSProperties = { padding: '16px', backgroundColor: '#f0f8ff', borderRadius: '8px', textAlign: 'center', border: '1px solid #b3d9ff' }
const statNum: React.CSSProperties = { margin: 0, fontSize: '28px', fontWeight: 700, color: '#1D7AFC' }
const statLabel: React.CSSProperties = { margin: '4px 0 0', fontSize: '12px', color: '#445166', textTransform: 'uppercase', letterSpacing: '0.05em' }
const btn: React.CSSProperties = { backgroundColor: '#1D7AFC', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: 600, padding: '12px 28px', textDecoration: 'none', display: 'inline-block' }
