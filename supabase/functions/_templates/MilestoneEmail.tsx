// supabase/functions/_templates/MilestoneEmail.tsx
import React from 'https://esm.sh/react@18'
import { Section, Text, Button, Hr } from 'https://esm.sh/@react-email/components@0.0.19'
import { BaseEmail } from './BaseEmail.tsx'

export interface MilestoneEmailProps {
  milestonePercent: 25 | 50 | 75 | 100;
  completedCount: number;
  totalCount: number;
  actionsUrl: string;
  reassessUrl?: string;
}

export function MilestoneEmail({ milestonePercent, completedCount, totalCount, actionsUrl, reassessUrl }: MilestoneEmailProps) {
  const isComplete = milestonePercent === 100
  return (
    <BaseEmail previewText={`${milestonePercent}% of your action plan is complete`}>
      <Text style={heading}>
        {isComplete ? 'Action plan complete!' : `${milestonePercent}% milestone reached`}
      </Text>
      <Text style={bodyText}>
        {isComplete
          ? `All ${totalCount} actions have been completed. Time to reassess and track your improvement.`
          : `You've completed ${completedCount} of ${totalCount} actions (${milestonePercent}%). Keep the momentum going.`
        }
      </Text>
      <Section style={{ margin: '20px 0' }}>
        <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '8px', width: `${milestonePercent}%`,
            background: 'linear-gradient(90deg, #1D7AFC 0%, #85B8FF 100%)',
            borderRadius: '4px',
          }} />
        </div>
        <Text style={{ margin: '8px 0 0', fontSize: '12px', color: '#6b7280', textAlign: 'right' }}>
          {milestonePercent}% complete
        </Text>
      </Section>
      <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0' }} />
      <Button href={actionsUrl} style={btn}>View Action Plan</Button>
      {isComplete && reassessUrl && (
        <Button href={reassessUrl} style={{ ...btn, marginLeft: '12px', backgroundColor: '#059669' }}>
          Start New Assessment
        </Button>
      )}
    </BaseEmail>
  )
}

const heading: React.CSSProperties = { margin: '0 0 12px', color: '#172d4d', fontSize: '18px', fontWeight: 600 }
const bodyText: React.CSSProperties = { margin: '0 0 16px', color: '#445166', fontSize: '14px', lineHeight: '1.6' }
const btn: React.CSSProperties = { backgroundColor: '#1D7AFC', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: 600, padding: '12px 28px', textDecoration: 'none', display: 'inline-block' }
