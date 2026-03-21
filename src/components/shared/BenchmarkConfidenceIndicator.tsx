import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import {
  getBenchmarkGovernance,
  getSourceTypeLabel,
  getConfidenceBadgeVariant,
  formatConfidenceNote,
  shouldShowCaution,
  type BenchmarkMetadata,
  type ConfidenceLevel,
} from '@/lib/benchmarkGovernance';
import { cn } from '@/lib/utils';

interface BenchmarkConfidenceIndicatorProps {
  kpiKey: string;
  language?: 'en' | 'de';
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

/**
 * BenchmarkConfidenceIndicator - Shows confidence level for benchmark data
 * 
 * Displays a visual indicator of benchmark reliability with tooltip context.
 */
export function BenchmarkConfidenceIndicator({
  kpiKey,
  language = 'en',
  showLabel = false,
  size = 'sm',
}: BenchmarkConfidenceIndicatorProps) {
  const metadata = getBenchmarkGovernance(kpiKey);
  const showCaution = shouldShowCaution(metadata);

  const getIcon = (level: ConfidenceLevel) => {
    const iconClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    switch (level) {
      case 'high':
        return <CheckCircle2 className={cn(iconClass, 'text-success')} />;
      case 'medium':
        return <Info className={cn(iconClass, 'text-warning')} />;
      case 'low':
        return <AlertCircle className={cn(iconClass, 'text-muted-foreground')} />;
      default:
        return <HelpCircle className={cn(iconClass, 'text-muted-foreground')} />;
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help">
          {getIcon(metadata.confidenceLevel)}
          {showLabel && (
            <span className={cn(
              'text-muted-foreground',
              size === 'sm' ? 'text-[10px]' : 'text-xs'
            )}>
              {getSourceTypeLabel(metadata.sourceType, language)}
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={getConfidenceBadgeVariant(metadata.confidenceLevel)} className="text-[10px]">
              {getSourceTypeLabel(metadata.sourceType, language)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatConfidenceNote(metadata, language)}
          </p>
          {showCaution && (
            <p className="text-[10px] text-warning-foreground bg-warning/10 px-2 py-1 rounded">
              {language === 'de'
                ? 'Mit händlerspezifischem Kontext verwenden'
                : 'Use with dealer-specific context'}
            </p>
          )}
          {metadata.sampleSize && (
            <p className="text-[10px] text-muted-foreground/70 mt-1 border-t border-border/30 pt-1">
              Based on {metadata.sampleSize}+ dealers · Updated {metadata.lastUpdated}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

interface BenchmarkNoteBadgeProps {
  kpiKey: string;
  language?: 'en' | 'de';
  className?: string;
}

/**
 * BenchmarkNoteBadge - Compact badge showing benchmark source type
 */
export function BenchmarkNoteBadge({
  kpiKey,
  language = 'en',
  className,
}: BenchmarkNoteBadgeProps) {
  const metadata = getBenchmarkGovernance(kpiKey);

  // Only show badge for non-verified sources
  if (metadata.sourceType === 'verified' && metadata.confidenceLevel === 'high') {
    return null;
  }

  const labels: Record<string, Record<string, string>> = {
    generic: { en: 'Ref', de: 'Ref' },
    estimated: { en: 'Est', de: 'Sch' },
    oem_specific: { en: 'OEM', de: 'OEM' },
    verified: { en: '', de: '' },
  };

  const label = labels[metadata.sourceType][language];
  if (!label) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className={cn(
            'text-[9px] px-1 py-0 h-4 font-normal text-muted-foreground border-muted cursor-help',
            className
          )}
        >
          {label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs">{formatConfidenceNote(metadata, language)}</p>
      </TooltipContent>
    </Tooltip>
  );
}
