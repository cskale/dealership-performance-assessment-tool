import { Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface KPITooltipProps {
  definition: string;
  whyItMatters?: string;
  benchmark?: string;
  resourcesLink?: string;
}

export function KPITooltip({ definition, whyItMatters, benchmark, resourcesLink }: KPITooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button 
          type="button"
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          aria-label="More information"
        >
          <Info className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        className="max-w-xs p-3 space-y-2"
        sideOffset={5}
      >
        <p className="text-sm font-medium">What is this?</p>
        <p className="text-xs text-muted-foreground">{definition}</p>
        
        {whyItMatters && (
          <>
            <p className="text-sm font-medium mt-2">Why it matters</p>
            <p className="text-xs text-muted-foreground">{whyItMatters}</p>
          </>
        )}
        
        {benchmark && (
          <p className="text-xs text-primary font-medium mt-2">
            Benchmark: {benchmark}
          </p>
        )}
        
        {resourcesLink && (
          <a 
            href={resourcesLink}
            className="block text-xs text-primary hover:underline mt-2"
          >
            📚 Related Resources →
          </a>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
