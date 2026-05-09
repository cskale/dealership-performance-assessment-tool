import { Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActorContextBannerProps {
  dealerName: string;
  location?: string;
  backLabel: string;
  onBack: () => void;
}

export function ActorContextBanner({ dealerName, location, backLabel, onBack }: ActorContextBannerProps) {
  return (
    <div
      className="sticky top-0 z-40 flex items-center justify-between px-6 overflow-hidden"
      style={{
        height: 40,
        background: "hsl(var(--brand-050))",
        borderLeft: "4px solid hsl(var(--brand-500))",
        borderBottom: "1px solid hsl(var(--brand-200))",
        animation: "actorBannerIn 200ms ease-out",
      }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Eye className="size-3.5 text-[hsl(var(--brand-600))] shrink-0" />
        <span className="text-body-sm font-medium text-foreground truncate">
          Viewing {dealerName}
        </span>
        {location && (
          <span className="text-body-sm text-muted-foreground truncate">
            · {location}
          </span>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 shrink-0">
        <ArrowLeft className="size-3.5" />
        {backLabel}
      </Button>
    </div>
  );
}
