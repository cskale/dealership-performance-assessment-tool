// src/pages/Dashboard.tsx
import { useState, useEffect, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useActiveRole } from '@/hooks/useActiveRole';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AlertCircle, Info, ClipboardList, ArrowRight, BarChart3, Zap, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateWeightedScore } from '@/lib/scoringEngine';
import { getMaturityLevel, MATURITY_LEVELS } from '@/lib/maturityConfig';
import {
  DEPT_DISPLAY_NAMES,
  DEPT_ORDER,
  deptScoreColour,
  deptMaturityColour,
  isOverdue,
  formatDisplayDate,
  formatDueDate,
  quarterLabel,
  nextAssessmentDue,
  endOfCurrentQuarter,
  relativeDays,
  deptFindingText,
  focusDepartment,
  criticalGapCount,
  heroNarrative,
} from '@/lib/dashboardUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AssessmentRow {
  id: string;
  completed_at: string;
  overall_score: number | null;
  scores: Record<string, number>;
  answers: Record<string, number>;
}

interface ActionRow {
  id: string;
  action_title: string;
  action_description: string;
  department: string;
  responsible_person: string | null;
  target_completion_date: string | null;
  priority: string;
  status: string | null;
}

interface CoachRow {
  coach_user_id: string;
  assigned_at: string;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean;
}

interface DashboardData {
  assessment: AssessmentRow;
  actions: ActionRow[];
  coach: CoachRow | null;
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

interface StatsBadgeProps {
  label: string;
  value: string;
  alert?: boolean;
}

function StatsBadge({ label, value, alert }: StatsBadgeProps) {
  return (
    <div className="flex items-center gap-2 pr-5 mr-5 border-r border-white/[0.08] h-9">
      <span className="text-[10px] font-medium text-white/35 tracking-[0.06em]">{label}</span>
      <span className={cn(
        'text-[11px] font-bold tabular-nums',
        alert ? 'text-[#f87171]' : 'text-white/85'
      )}>{value}</span>
    </div>
  );
}

// ─── Hero Card ────────────────────────────────────────────────────────────────

interface HeroCardProps {
  overallScore: number;
  maturityLabel: string;
  narrative: string;
  openActions: ActionRow[];
  focusDeptName: string;
  focusDeptScore: number;
  focusDeptKey: string;
}

function HeroCard({
  overallScore, maturityLabel, narrative,
  openActions, focusDeptName, focusDeptScore, focusDeptKey,
}: HeroCardProps) {
  const topActions = openActions.slice(0, 3);
  const focusMaturity = MATURITY_LEVELS[getMaturityLevel(focusDeptScore)].label;

  return (
    <div
      className="rounded-2xl overflow-hidden grid grid-cols-3"
      style={{ background: '#0b1f3a' }}
    >
      {/* Col 1 — Overall score */}
      <div className="p-7 border-r border-white/[0.07]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35 mb-4">
          Overall Diagnostic Score
        </p>
        <div className="flex items-baseline gap-2">
          <span
            className="text-[72px] font-extrabold text-white leading-none tabular-nums"
            style={{ letterSpacing: '-0.05em', fontOpticalSizing: 'auto' } as React.CSSProperties}
          >
            {Math.round(overallScore)}
          </span>
          <span className="text-[18px] font-medium text-white/35">/ 100</span>
        </div>
        <div className="mt-4 h-[5px] rounded-full bg-white/10">
          <div
            className="h-[5px] rounded-full"
            style={{
              width: `${Math.min(100, Math.round(overallScore))}%`,
              background: 'linear-gradient(90deg, #1D7AFC 0%, #85B8FF 100%)',
            }}
          />
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 bg-[rgba(29,122,252,0.2)] text-[#85B8FF] rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.05em]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#579DFF]" />
          {maturityLabel}
        </div>
        <p className="mt-4 text-[11px] italic text-white/38 leading-relaxed border-t border-white/[0.07] pt-4">
          "{narrative}"
        </p>
      </div>

      {/* Col 2 — Open actions */}
      <div className="p-7 border-r border-white/[0.07]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35 mb-4">
          Open Actions
        </p>
        <span
          className="text-[72px] font-extrabold text-white leading-none tabular-nums"
          style={{ letterSpacing: '-0.05em', fontOpticalSizing: 'auto' } as React.CSSProperties}
        >
          {openActions.length}
        </span>
        <p className="text-[13px] text-white/40 mt-2 mb-5">items requiring attention</p>
        <div className="space-y-2">
          {topActions.map(a => (
            <div key={a.id} className="flex items-start gap-2">
              <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
              <p className="text-[11px] text-white/50 leading-snug">
                <strong className="text-white/80 font-semibold">
                  {DEPT_DISPLAY_NAMES[a.department] ?? a.department}:
                </strong>{' '}
                {a.action_title}
                {a.target_completion_date && ` — due ${formatDueDate(a.target_completion_date)}`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Col 3 — Focus department */}
      <div className="p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35 mb-4">
          Focus Department
        </p>
        <p
          className="text-[20px] font-extrabold text-white mb-2"
          style={{ letterSpacing: '-0.02em', fontOpticalSizing: 'auto' } as React.CSSProperties}
        >
          {focusDeptName}
        </p>
        <div className="flex items-baseline gap-3 mb-2">
          <span
            className="text-[56px] font-extrabold text-white leading-none tabular-nums"
            style={{ letterSpacing: '-0.04em', fontOpticalSizing: 'auto' } as React.CSSProperties}
          >
            {Math.round(focusDeptScore)}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-white/40">
            {focusMaturity}
          </span>
        </div>
        <p className="text-[11px] text-white/40 leading-relaxed border-t border-white/[0.07] pt-4">
          {deptFindingText(focusDeptKey, focusDeptScore)}
        </p>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onStart }: { onStart: () => void }) {
  const benefits = [
    { icon: BarChart3, label: 'Scored across 5 departments' },
    { icon: Zap,       label: 'Diagnostic signals in minutes' },
    { icon: Award,     label: 'Prioritised action plan' },
  ];
  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      <div className="max-w-xl mx-auto mt-8 bg-white rounded-xl shadow-card border border-[#DFE1E6] p-8 space-y-6 text-center">
        <ClipboardList className="h-14 w-14 text-[#85B8FF] mx-auto" />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-[#091E42]">
            Run your first dealership diagnostic
          </h1>
          <p className="text-sm text-[#5E6C84] leading-relaxed">
            A 45-minute structured assessment across 5 departments. Get a scored
            performance profile, diagnostic signals, and a prioritised action plan.
          </p>
        </div>
        <Button size="lg" className="w-full sm:w-auto" onClick={onStart}>
          Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <div className="grid grid-cols-3 gap-4">
          {benefits.map(b => (
            <div key={b.label} className="bg-[#F7FAFF] rounded-lg p-3 flex flex-col items-center gap-2">
              <b.icon className="h-5 w-5 text-[#579DFF]" />
              <span className="text-xs text-[#5E6C84]">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { actorType } = useActiveRole();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hasAssessments, setHasAssessments] = useState<boolean | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;

    (async () => {
      const { data: assessments } = await supabase
        .from('assessments')
        .select('id, completed_at, overall_score, scores, answers')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1);

      if (cancelled) return;

      if (!assessments || assessments.length === 0) {
        setHasAssessments(false);
        setLoading(false);
        return;
      }

      const assessment = assessments[0] as AssessmentRow;
      setHasAssessments(true);

      const { data: actions } = await supabase
        .from('improvement_actions')
        .select('id, action_title, action_description, department, responsible_person, target_completion_date, priority, status')
        .eq('assessment_id', assessment.id)
        .neq('status', 'completed')
        .order('target_completion_date', { ascending: true });

      const { data: coachRows } = await supabase
        .from('coach_dealership_assignments')
        .select('coach_user_id, assigned_at, valid_from, valid_to, is_active')
        .eq('is_active', true)
        .limit(1);

      if (cancelled) return;

      setData({
        assessment,
        actions: (actions ?? []) as ActionRow[],
        coach: coachRows?.[0] as CoachRow ?? null,
      });
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user]);

  const derived = useMemo(() => {
    if (!data) return null;
    const { assessment, actions } = data;
    const scores = (assessment.scores as Record<string, number>) ?? {};
    const overallScore = assessment.overall_score ?? calculateWeightedScore(scores);
    const maturityKey = getMaturityLevel(overallScore);
    const maturityLabel = MATURITY_LEVELS[maturityKey].label;
    const focusDeptKey = focusDepartment(scores);
    const focusDeptName = DEPT_DISPLAY_NAMES[focusDeptKey] ?? '—';
    const focusDeptScore = scores[focusDeptKey] ?? 0;
    const gapCount = criticalGapCount(scores);
    const openCount = actions.length;
    const narrative = heroNarrative(scores, overallScore);
    const quarter = quarterLabel(assessment.completed_at);

    return {
      scores, overallScore, maturityKey, maturityLabel,
      focusDeptKey, focusDeptName, focusDeptScore,
      gapCount, openCount, narrative, quarter,
    };
  }, [data]);

  if (actorType === 'coach') return <Navigate to="/app/coach-dashboard" replace />;
  if (actorType === 'oem')   return <Navigate to="/app/oem-dashboard"   replace />;

  if (loading || hasAssessments === null) {
    return <div className="min-h-screen bg-[#F7F8F9]" />;
  }

  if (!hasAssessments || !data || !derived) {
    return (
      <div className="min-h-screen bg-[#F7F8F9]">
        <EmptyState onStart={() => navigate('/app/assessment')} />
      </div>
    );
  }

  const { assessment, actions, coach } = data;
  const {
    scores, overallScore, maturityLabel,
    focusDeptKey, focusDeptName, focusDeptScore,
    gapCount, openCount, narrative, quarter,
  } = derived;

  return (
    <div className="min-h-screen bg-[#F7F8F9]">

      {/* ── Dark stats bar ── */}
      <div
        className="flex items-center h-9 px-6"
        style={{ background: '#0b1f3a' }}
      >
        <StatsBadge label="Overall Score" value={`${Math.round(overallScore)} / 100`} />
        <StatsBadge label="Assessment date" value={formatDisplayDate(assessment.completed_at)} />
        <StatsBadge
          label="Critical gaps"
          value={gapCount > 0 ? `${gapCount} department${gapCount > 1 ? 's' : ''}` : 'None'}
          alert={gapCount > 0}
        />
        <StatsBadge label="Open actions" value={`${openCount} item${openCount !== 1 ? 's' : ''}`} />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] font-semibold text-white/60">Dealer Principal</span>
          <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-[#1D7AFC] to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
            DP
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-4">

        {/* ── Page header ── */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B778C] mb-1">
              Performance Intelligence · {quarter}
            </p>
            <h1
              className="text-[28px] font-extrabold text-[#091E42]"
              style={{ letterSpacing: '-0.022em', fontOpticalSizing: 'auto' } as React.CSSProperties}
            >
              Diagnostic Command
            </h1>
          </div>
          <button
            onClick={() => navigate('/app/results')}
            className="flex items-center gap-2 px-4 py-2 bg-[#0b1f3a] text-white rounded-lg text-[12px] font-semibold hover:bg-[#122a4a] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 2v8M5 7l3 3 3-3M3 13h10"/></svg>
            View Full Report
          </button>
        </div>

        {/* ── Hero card ── */}
        <HeroCard
          overallScore={overallScore}
          maturityLabel={maturityLabel}
          narrative={narrative}
          openActions={actions}
          focusDeptName={focusDeptName}
          focusDeptScore={focusDeptScore}
          focusDeptKey={focusDeptKey}
        />

        {/* placeholder — Tasks 6-9 */}

      </main>
    </div>
  );
}
