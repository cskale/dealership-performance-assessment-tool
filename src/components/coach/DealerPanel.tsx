import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { getScoreBand } from '@/lib/coachDashboardUtils';
import { type AssignedDealer } from '@/pages/CoachDashboard';

export interface DealerPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealer: AssignedDealer;
  latestAssessmentId: string | null;
  latestScore: number | null;
  latestDate: string | null;
  initialTab?: 'activity' | 'visits' | 'briefing';
  onVisitSaved: () => void;
  onNoteAdded: () => void;
}

export function DealerPanel({
  open,
  onOpenChange,
  dealer,
  latestAssessmentId: _latestAssessmentId,
  latestScore,
  latestDate: _latestDate,
  initialTab = 'activity',
  onVisitSaved: _onVisitSaved,
  onNoteAdded: _onNoteAdded,
}: DealerPanelProps) {
  const [activeTab, setActiveTab] = useState<'activity' | 'visits' | 'briefing'>(initialTab);

  useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [open, initialTab]);

  const TABS = ['activity', 'visits', 'briefing'] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold leading-tight">
                {dealer.dealerName}
              </DialogTitle>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 shrink-0" />
                {dealer.location}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              {latestScore != null && (() => {
                const band = getScoreBand(latestScore);
                return (
                  <>
                    <span className="text-sm font-bold text-foreground">
                      {Math.round(latestScore)}
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${band.className}`}>
                      {band.label}
                    </Badge>
                  </>
                );
              })()}
            </div>
          </div>
        </DialogHeader>

        {/* Tab strip */}
        <div className="flex border-b border-border px-6 shrink-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
                activeTab === tab
                  ? 'border-[hsl(var(--brand-500))] text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab bodies */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'activity' && (
            <div className="p-6">
              <p className="text-sm text-muted-foreground">Activity loading…</p>
            </div>
          )}
          {activeTab === 'visits' && (
            <div className="p-6">
              <p className="text-sm text-muted-foreground">Visits loading…</p>
            </div>
          )}
          {activeTab === 'briefing' && (
            <div className="p-6">
              <p className="text-sm text-muted-foreground">Briefing loading…</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
