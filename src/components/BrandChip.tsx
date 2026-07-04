import { cn } from '@/lib/utils';

interface BrandChipProps {
  label: string;
  /** Reserved for future logo system; unused today. */
  logoUrl?: string;
  className?: string;
}

/**
 * Lightweight brand chip: two-letter monogram + label.
 * `logoUrl` is intentionally unused today — reserved so a future
 * brand-logo lookup system can wire in without touching call sites.
 */
export function BrandChip({ label, logoUrl: _logoUrl, className }: BrandChipProps) {
  const monogram = label
    .replace(/[^A-Za-z0-9\s-]/g, '')
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('') || label.slice(0, 2).toUpperCase();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full',
        'bg-[hsl(var(--dd-accent-light))] text-[hsl(var(--dd-accent))]',
        'border border-[hsl(var(--dd-accent))]/15 text-xs font-medium',
        className,
      )}
    >
      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[hsl(var(--dd-accent))] text-white text-[10px] font-semibold tracking-tight">
        {monogram}
      </span>
      {label}
    </span>
  );
}

export default BrandChip;
