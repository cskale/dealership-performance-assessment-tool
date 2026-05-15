interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export function ScoreGauge({ score, size = 72 }: ScoreGaugeProps) {
  const r = size * 0.39;
  const circ = 2 * Math.PI * r;
  const filled = Math.min(Math.max(score, 0), 100) / 100 * circ;
  const cx = size / 2;
  const cy = size / 2;

  const accent =
    score >= 85 ? '#16a34a' :
    score >= 70 ? '#2563eb' :
    score >= 46 ? '#d97706' :
                  '#dc2626';

  return (
    <svg role="img" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`Score ${Math.round(score)}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
      {filled > 0 && (
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={accent} strokeWidth="5"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      )}
      <text
        x={cx} y={cy + 5}
        textAnchor="middle"
        fontSize={size * 0.19}
        fontWeight="700"
        fill="currentColor"
        aria-hidden="true"
      >
        {Math.round(score)}
      </text>
    </svg>
  );
}
