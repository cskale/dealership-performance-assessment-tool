type Tier = 'Standard' | 'Silver' | 'Gold' | 'Platinum';

interface TierBadgeProps {
  tier?: Tier | string | null;
  size?: 'sm' | 'md';
}

const TIER_TOKENS: Record<Tier, { background: string; color: string; borderColor: string }> = {
  Standard: {
    background: 'hsl(var(--neutral-100))',
    color: 'hsl(var(--neutral-700))',
    borderColor: 'hsl(var(--neutral-300))',
  },
  Silver: {
    background: 'oklch(0.96 0.01 220)',
    color: 'oklch(0.30 0.02 220)',
    borderColor: 'oklch(0.82 0.02 220)',
  },
  Gold: {
    background: 'oklch(0.96 0.08 85)',
    color: 'oklch(0.40 0.10 70)',
    borderColor: 'oklch(0.80 0.10 80)',
  },
  Platinum: {
    background: 'oklch(0.97 0.04 250)',
    color: 'oklch(0.25 0.05 250)',
    borderColor: 'hsl(var(--brand-300))',
  },
};

export function TierBadge({ tier, size = 'md' }: TierBadgeProps) {
  if (!tier) return null;
  if (!(tier in TIER_TOKENS)) return null;

  const tokens = TIER_TOKENS[tier as Tier];
  const sizeClass =
    size === 'sm'
      ? 'px-2 py-0 text-caption'
      : 'px-2.5 py-0.5 text-label';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${sizeClass}`}
      style={{
        background: tokens.background,
        color: tokens.color,
        borderColor: tokens.borderColor,
      }}
    >
      <span
        className="inline-block w-1 h-1 rounded-full mr-0.5"
        style={{ background: tokens.color, width: 4, height: 4 }}
        aria-hidden
      />
      {tier}
    </span>
  );
}
