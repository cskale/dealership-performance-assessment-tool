import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { getScoreBand } from '@/lib/coachDashboardUtils';
import { type AssignedDealer } from '@/pages/CoachDashboard';
import { type CoachVisit } from '@/lib/coachVisitUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// ── Local types ────────────────────────────────────────────────────────────────

interface CoachNote {
  id: string;
  coach_user_id: string;
  dealership_id: string;
  assessment_id: string | null;
  action_id: string | null;
  note_text: string;
  note_type: 'observation' | 'action' | 'follow-up' | null;
  created_at: string;
}

interface FocusAction {
  id: string;
  action_title: string;
  priority: string;
  last_status_updated_at: string | null;
}

interface CompletedAssessment {
  id: string;
  overall_score: number | null;
  created_at: string;
}

interface PanelData {
  notes: CoachNote[];
  visits: CoachVisit[];
  assessmentScores: Record<string, number>;
  focusActions: FocusAction[];
  completedAssessments: CompletedAssessment[];
}

// ── Tab constant (module-level so it is stable across renders) ─────────────────

const TABS = ['activity', 'visits', 'briefing'] as const;

// ── Props ─────────────────────────────────────────────────────────────────────
// Live now:   open, onOpenChange, dealer, latestScore, latestAssessmentId
// Reserved:   latestDate, onVisitSaved, onNoteAdded, initialTab  (wired in later tasks)

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
  latestAssessmentId,
  latestScore,
  latestDate,
  initialTab = 'activity',
  onVisitSaved,
  onNoteAdded,
}: DealerPanelProps) {
  const [activeTab, setActiveTab] = useState<'activity' | 'visits' | 'briefing'>(initialTab);

  useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [open, initialTab]);

  const { user } = useAuth();
  const [data, setData] = useState<PanelData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  const fetchData = async () => {
    if (!user?.id) return;
    setDataLoading(true);
    try {
      const [notesRes, visitsRes, assessmentsRes] = await Promise.all([
        supabase
          .from('coach_notes')
          .select('*')
          .eq('dealership_id', dealer.dealershipId)
          .eq('coach_user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('coach_visits')
          .select('*')
          .eq('dealership_id', dealer.dealershipId)
          .eq('coach_user_id', user.id)
          .order('visit_date', { ascending: false }),
        supabase
          .from('assessments')
          .select('id, overall_score, created_at')
          .eq('dealership_id', dealer.dealershipId)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const completedAssessments = (assessmentsRes.data ?? []) as CompletedAssessment[];
      const assessmentIds = completedAssessments.map(a => a.id);

      let assessmentScores: Record<string, number> = {};
      if (latestAssessmentId) {
        const { data: scoreRow } = await supabase
          .from('assessments')
          .select('scores')
          .eq('id', latestAssessmentId)
          .single();
        assessmentScores = (scoreRow as any)?.scores ?? {};
      }

      let focusActions: FocusAction[] = [];
      if (assessmentIds.length) {
        const { data: actionsData } = await supabase
          .from('improvement_actions')
          .select('id, action_title, priority, last_status_updated_at')
          .in('assessment_id', assessmentIds)
          .in('status', ['Open', 'In Progress'])
          .order('urgency_score', { ascending: false, nullsFirst: false })
          .limit(3);
        focusActions = (actionsData ?? []) as FocusAction[];
      }

      setData({
        notes: (notesRes.data ?? []) as CoachNote[],
        visits: (visitsRes.data ?? []) as CoachVisit[],
        assessmentScores,
        focusActions,
        completedAssessments,
      });
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dealer.dealershipId]);

  // Suppress unused-variable warnings for props reserved for later tasks
  void latestDate;
  void onVisitSaved;
  void onNoteAdded;

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
              {dataLoading
                ? <p className="text-sm text-muted-foreground">Loading…</p>
                : <p className="text-sm text-muted-foreground">Activity feed coming in Task 3.</p>
              }
            </div>
          )}
          {activeTab === 'visits' && (
            <div className="p-6">
              {dataLoading
                ? <p className="text-sm text-muted-foreground">Loading…</p>
                : <p className="text-sm text-muted-foreground">Visits coming in Task 4.</p>
              }
            </div>
          )}
          {activeTab === 'briefing' && (
            <div className="p-6">
              {dataLoading
                ? <p className="text-sm text-muted-foreground">Loading…</p>
                : <p className="text-sm text-muted-foreground">Briefing coming in Task 5.</p>
              }
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
