import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CoachVisitWorkspace } from '@/components/coach/CoachVisitWorkspace';
import type { AssignedDealer } from '@/pages/CoachDashboard';

export interface DealerPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealer: AssignedDealer;
  latestAssessmentId: string | null;
  latestScore: number | null;
  latestDate: string | null;
  initialTab?: 'activity' | 'visits' | 'notes';
  onVisitSaved: () => void;
  onNoteAdded: () => void;
}

export function DealerPanel({ open, onOpenChange, dealer, latestAssessmentId, latestScore, onVisitSaved }: DealerPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-screen w-screen max-w-none overflow-y-auto border-0 p-0 sm:rounded-none [&>button]:hidden">
        <CoachVisitWorkspace
          dealershipId={dealer.dealershipId}
          dealerName={dealer.dealerName}
          location={dealer.location}
          latestScore={latestScore}
          latestAssessmentId={latestAssessmentId}
          onClose={() => onOpenChange(false)}
          onVisitSaved={onVisitSaved}
        />
      </DialogContent>
    </Dialog>
  );
}
