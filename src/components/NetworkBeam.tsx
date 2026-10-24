import { ReactNode, createRef, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatedBeam } from '@/components/ui/animated-beam';
import { cn } from '@/lib/utils';

export interface NetworkBeamNode {
  id: string;
  label: string;
  sublabel?: string;
  score?: number | null;
  onClick?: () => void;
}

interface NetworkBeamProps {
  center: { label: string; sublabel?: string; icon?: ReactNode };
  nodes: NetworkBeamNode[];
  maxNodes?: number;
  className?: string;
}

function initials(label: string): string {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
    .join('');
}

function ringClass(score: number | null | undefined): string {
  if (score == null) return 'ring-border';
  if (score >= 75) return 'ring-emerald-500';
  if (score >= 50) return 'ring-amber-500';
  return 'ring-red-500';
}

function curvatureFor(index: number, total: number): number {
  if (total <= 1) return 0;
  const mid = (total - 1) / 2;
  if (index < mid) return -75;
  if (index > mid) return 75;
  return 0;
}

export function NetworkBeam({ center, nodes, maxNodes = 8, className }: NetworkBeamProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, React.RefObject<HTMLDivElement>>());
  const refFor = (id: string): React.RefObject<HTMLDivElement> => {
    let ref = nodeRefs.current.get(id);
    if (!ref) {
      ref = createRef<HTMLDivElement>();
      nodeRefs.current.set(id, ref);
    }
    return ref;
  };

  if (nodes.length === 0) {
    return (
      <p className={cn('py-8 text-center text-sm text-muted-foreground', className)}>
        {t('network.empty')}
      </p>
    );
  }

  const overflow = nodes.length > maxNodes ? nodes.length - (maxNodes - 1) : 0;
  const visible = overflow > 0 ? nodes.slice(0, maxNodes - 1) : nodes;
  const displayNodes: NetworkBeamNode[] = overflow > 0
    ? [...visible, { id: '__more__', label: t('network.more').replace('{count}', String(overflow)), score: null }]
    : visible;

  const half = Math.ceil(displayNodes.length / 2);
  const leftNodes = displayNodes.slice(0, half);
  const rightNodes = displayNodes.slice(half);

  const renderNode = (
    node: NetworkBeamNode,
    side: 'left' | 'right',
    index: number,
  ) => {
    const clickable = !!node.onClick;
    const inner = (
      <>
        <div
          ref={refFor(node.id)}
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-card text-xs font-semibold text-foreground ring-2 ring-offset-2 ring-offset-background sm:h-12 sm:w-12',
            ringClass(node.score),
          )}
        >
          {node.id === '__more__' ? `+${overflow}` : initials(node.label)}
        </div>
        <div className={cn('max-w-[7rem] text-center', side === 'left' ? 'sm:text-right' : 'sm:text-left')}>
          <p className="truncate text-xs font-medium text-foreground">{node.label}</p>
          {node.sublabel && (
            <p className="truncate text-[11px] text-muted-foreground">{node.sublabel}</p>
          )}
        </div>
      </>
    );
    const rowClass = cn(
      'flex items-center gap-2 rounded-lg p-1',
      side === 'left' ? 'flex-row sm:flex-row-reverse' : 'flex-row',
      clickable && 'cursor-pointer transition-colors hover:bg-muted/60',
    );
    return clickable ? (
      <button key={node.id} type="button" onClick={node.onClick} className={rowClass}>
        {inner}
      </button>
    ) : (
      <div key={node.id} className={rowClass}>
        {inner}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex items-center justify-between gap-2 overflow-hidden py-4 sm:gap-6',
        className,
      )}
    >
      {/* Left column */}
      <div className="z-10 flex flex-col justify-center gap-3 sm:gap-5">
        {leftNodes.map((n, i) => renderNode(n, 'left', i))}
      </div>

      {/* Center hub */}
      <div className="z-10 flex flex-col items-center gap-2 px-1">
        <div
          ref={centerRef}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-primary/20 sm:h-20 sm:w-20"
        >
          {center.icon ?? (
            <span className="text-sm font-bold">{initials(center.label)}</span>
          )}
        </div>
        <div className="max-w-[8rem] text-center">
          <p className="truncate text-xs font-semibold text-foreground">{center.label}</p>
          {center.sublabel && (
            <p className="truncate text-[11px] text-muted-foreground">{center.sublabel}</p>
          )}
        </div>
      </div>

      {/* Right column */}
      <div className="z-10 flex flex-col justify-center gap-3 sm:gap-5">
        {rightNodes.map((n, i) => renderNode(n, 'right', i))}
      </div>

      {/* Beams */}
      {leftNodes.map((n, i) => (
        <AnimatedBeam
          key={`l-${n.id}`}
          containerRef={containerRef}
          fromRef={refFor(n.id) as React.RefObject<HTMLElement>}
          toRef={centerRef as React.RefObject<HTMLElement>}
          curvature={curvatureFor(i, leftNodes.length)}
          duration={5}
          pathColor="hsl(var(--muted-foreground))"
          pathOpacity={0.15}
          gradientStartColor="hsl(var(--primary))"
          gradientStopColor="hsl(var(--primary))"
        />
      ))}
      {rightNodes.map((n, i) => (
        <AnimatedBeam
          key={`r-${n.id}`}
          containerRef={containerRef}
          fromRef={refFor(n.id) as React.RefObject<HTMLElement>}
          toRef={centerRef as React.RefObject<HTMLElement>}
          curvature={curvatureFor(i, rightNodes.length)}
          reverse
          duration={5}
          pathColor="hsl(var(--muted-foreground))"
          pathOpacity={0.15}
          gradientStartColor="hsl(var(--primary))"
          gradientStopColor="hsl(var(--primary))"
        />
      ))}
    </div>
  );
}
