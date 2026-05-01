import { getAssessmentFreshness } from '@/lib/assessmentFreshness';

interface FreshnessBadgeProps {
  completedAt: string | null | undefined;
  onReassess?: () => void;
}

export function FreshnessBadge({ completedAt, onReassess }: FreshnessBadgeProps) {
  const freshness = getAssessmentFreshness(completedAt);

  const pillBase: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 500,
    padding: '2px 9px',
    borderRadius: 99,
    border: '1px solid',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  };

  let pillStyle: React.CSSProperties;
  let dotColor: string | null = null;
  let label: string;

  if (freshness.status === 'current') {
    pillStyle = { ...pillBase, background: '#e8f5ee', color: '#1a6b3c', borderColor: '#b8dfc8' };
    dotColor = '#1a6b3c';
    label = 'Current';
  } else if (freshness.status === 'ageing') {
    pillStyle = { ...pillBase, background: '#fef6e4', color: '#92610a', borderColor: '#f0d59a' };
    label = `Ageing — ${freshness.daysSince}d`;
  } else {
    pillStyle = { ...pillBase, background: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' };
    label = `Stale — ${freshness.daysSince}d`;
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span style={pillStyle}>
        {dotColor && (
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: 99,
              background: dotColor,
              display: 'inline-block',
            }}
          />
        )}
        {label}
      </span>
      {freshness.showCta && onReassess && (
        <button
          type="button"
          onClick={onReassess}
          style={{
            fontSize: 11,
            color: '#0052CC',
            marginLeft: 8,
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Reassess now
        </button>
      )}
    </span>
  );
}
