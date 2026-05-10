// src/pages/Dashboard.tsx
import { useState, useEffect, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useActiveRole } from '@/hooks/useActiveRole';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ClipboardList, ArrowRight, BarChart3, Zap, Award, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateWeightedScore } from '@/lib/scoringEngine';
import { getMaturityLevel, MATURITY_LEVELS } from '@/lib/maturityConfig';
import {
  DEPT_DISPLAY_NAMES,
  DEPT_ORDER,
  formatDisplayDate,
  formatDueDate,
  quarterLabel,
  deptFindingText,
  deptScoreColour,
  deptMaturityColour,
  focusDepartment,
  criticalGapCount,
  heroNarrative,
  isOverdue,
  nextAssessmentDue,
  endOfCurrentQuarter,
  relativeDays,
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

// ─── Timeline Strip ───────────────────────────────────────────────────────────

type TimelineStatus = 'done' | 'upcoming' | 'overdue';

interface TimelineSlotProps {
  label: string;
  date: string;
  sub: string;
  status: TimelineStatus;
  badgeText: string;
}

function TimelineSlot({ label, date, sub, status, badgeText }: TimelineSlotProps) {
  const dotColor = {
    done:     'bg-[#22c55e]',
    upcoming: 'bg-[#579DFF]',
    overdue:  'bg-[#ef4444]',
  }[status];

  const badgeStyle = {
    done:     'bg-[#f0fdf4] text-[#15803d]',
    upcoming: 'bg-[#E9F2FF] text-[#1558BC]',
    overdue:  'bg-[#fef2f2] text-[#ef4444]',
  }[status];

  return (
    <div className="px-5 py-4 border-r border-[#F1F2F4] last:border-r-0 relative">
      <span className={cn('absolute top-4 right-4 w-2 h-2 rounded-full', dotColor)} />
      <p className="text-[10px] font-semibold text-[#6B778C] mb-1">{label}</p>
      <p className="text-[13px] font-bold text-[#172B4D] mb-0.5">{date}</p>
      <p className="text-[10px] text-[#6B778C] mb-2">{sub}</p>
      <span className={cn('inline-block text-[9px] font-bold px-2 py-0.5 rounded-full', badgeStyle)}>
        {badgeText}
      </span>
    </div>
  );
}

function TimelineStrip({
  assessment,
  coach,
}: {
  assessment: AssessmentRow;
  coach: CoachRow | null;
}) {
  const nextDue = nextAssessmentDue(assessment.completed_at);
  const qEnd    = endOfCurrentQuarter();
  const nextDueOverdue = isOverdue(nextDue);

  const coachAssignedDate = coach?.assigned_at
    ? formatDisplayDate(coach.assigned_at)
    : null;

  // A coach visit is "done" if valid_from is in the past, otherwise upcoming
  const coachVisitDone = coach
    ? isOverdue(coach.valid_from ?? coach.assigned_at)
    : false;

  return (
    <div className="bg-white rounded-xl shadow-card border border-[#DFE1E6] grid grid-cols-5 overflow-hidden">
      <TimelineSlot
        label="Last Assessment"
        date={formatDisplayDate(assessment.completed_at)}
        sub={`${Object.keys(assessment.answers ?? {}).length} questions · completed`}
        status="done"
        badgeText="Completed"
      />
      <TimelineSlot
        label="Next Assessment Due"
        date={formatDisplayDate(nextDue)}
        sub={relativeDays(nextDue)}
        status={nextDueOverdue ? 'overdue' : 'upcoming'}
        badgeText={nextDueOverdue ? 'Overdue' : 'Upcoming'}
      />
      <TimelineSlot
        label="Last Coach Visit"
        date={coachAssignedDate ?? 'Not scheduled'}
        sub={coach ? 'Field coach assigned' : 'No coach assigned'}
        status={coach ? (coachVisitDone ? 'done' : 'upcoming') : 'upcoming'}
        badgeText={coach ? (coachVisitDone ? 'Completed' : 'Scheduled') : 'Not scheduled'}
      />
      <TimelineSlot
        label="Next Coach Visit"
        date={coach?.valid_to ? formatDisplayDate(coach.valid_to) : 'Not scheduled'}
        sub={coach?.valid_to ? relativeDays(coach.valid_to) : 'Contact your programme manager'}
        status="upcoming"
        badgeText={coach?.valid_to ? 'Scheduled' : 'Not scheduled'}
      />
      <TimelineSlot
        label="Action Plan Review"
        date={formatDisplayDate(qEnd)}
        sub="End of quarter · all departments"
        status="upcoming"
        badgeText="Upcoming"
      />
    </div>
  );
}

// ─── Priority Intervention Card ───────────────────────────────────────────────

function PriorityCard({
  focusDeptName,
  focusDeptScore,
  quarter,
}: {
  focusDeptName: string;
  focusDeptScore: number;
  quarter: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-4 px-5 py-4 bg-[#fef2f2] border border-[#fecaca] border-l-[3px] border-l-[#ef4444] rounded-xl shadow-card">
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-[#ef4444] mb-1">
          Priority Intervention Required
        </p>
        <p className="text-[12px] text-[#253858] leading-relaxed">
          {focusDeptName} scored {Math.round(focusDeptScore)}/100 and requires immediate
          attention. Review the open actions and assign ownership before the {quarter} deadline.
        </p>
      </div>
      <button
        onClick={() => navigate('/app/actions')}
        className="flex-shrink-0 px-5 py-2 bg-[#ef4444] text-white rounded-lg text-[12px] font-bold hover:bg-[#dc2626] transition-colors"
      >
        Resolve Now
      </button>
    </div>
  );
}

// ─── Departmental Intelligence Grid ──────────────────────────────────────────

function DeptGrid({ scores }: { scores: Record<string, number> }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-[#172B4D]">Departmental Intelligence</h2>
        <span className="text-[11px] font-semibold text-[#6B778C]">Performance matrix ⓘ</span>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-[#DFE1E6] grid grid-cols-5 overflow-hidden">
        {DEPT_ORDER.map((key, i) => {
          const score = scores[key] ?? 0;
          const maturity = MATURITY_LEVELS[getMaturityLevel(score)].label;
          const scoreColour    = deptScoreColour(score);
          const maturityColour = deptMaturityColour(score);
          const finding = deptFindingText(key, score);

          return (
            <div
              key={key}
              className={cn(
                'p-4 pb-4',
                i < DEPT_ORDER.length - 1 && 'border-r border-[#F1F2F4]'
              )}
            >
              <p className="text-[10px] font-bold text-[#5E6C84] mb-2 leading-tight">
                {DEPT_DISPLAY_NAMES[key]}
              </p>
              <p
                className={cn(
                  'text-[38px] font-extrabold leading-none tabular-nums mb-0.5',
                  scoreColour
                )}
                style={{ letterSpacing: '-0.03em', fontOpticalSizing: 'auto' } as React.CSSProperties}
              >
                {Math.round(score)}
              </p>
              <p className={cn('text-[10px] font-bold uppercase tracking-[0.05em] mb-3', maturityColour)}>
                {maturity}
              </p>
              <p className="text-[10.5px] text-[#5E6C84] leading-relaxed border-t border-[#F1F2F4] pt-2">
                {finding}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── Open Actions Table ───────────────────────────────────────────────────────

function ActionsTable({
  actions,
  onViewAll,
}: {
  actions: ActionRow[];
  onViewAll: () => void;
}) {
  if (actions.length === 0) return null;

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-[#172B4D]">Open Actions</h2>
        <button
          onClick={onViewAll}
          className="text-[11px] font-semibold text-[#6B778C] hover:text-[#1D7AFC] transition-colors"
        >
          View all in Action Plans →
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-[#DFE1E6] px-5 py-5">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Action', 'Department', 'Responsible', 'Due'].map(h => (
                <th
                  key={h}
                  className="text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#97A0AF] pb-3"
                  style={{ paddingRight: h !== 'Due' ? '20px' : undefined }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {actions.map(action => {
              const overdue = isOverdue(action.target_completion_date);
              const deptName = DEPT_DISPLAY_NAMES[action.department] ?? action.department;

              return (
                <tr key={action.id}>
                  <td
                    className="text-[12px] text-[#253858] font-medium py-[10px] border-t border-[#F1F2F4] align-top"
                    style={{ paddingRight: '20px' }}
                  >
                    <span
                      className={cn(
                        'inline-block w-[7px] h-[7px] rounded-full mr-2 flex-shrink-0 align-middle',
                        overdue ? 'bg-[#ef4444]' : 'bg-[#1D7AFC]'
                      )}
                    />
                    {action.action_title}
                  </td>
                  <td
                    className="text-[12px] text-[#5E6C84] py-[10px] border-t border-[#F1F2F4] align-top whitespace-nowrap"
                    style={{ paddingRight: '20px' }}
                  >
                    {deptName}
                  </td>
                  <td
                    className="text-[12px] text-[#5E6C84] py-[10px] border-t border-[#F1F2F4] align-top whitespace-nowrap"
                    style={{ paddingRight: '20px' }}
                  >
                    {action.responsible_person ?? '—'}
                  </td>
                  <td
                    className={cn(
                      'text-[11px] font-semibold py-[10px] border-t border-[#F1F2F4] align-top whitespace-nowrap',
                      overdue ? 'text-[#ef4444]' : 'text-[#6B778C]'
                    )}
                  >
                    {formatDueDate(action.target_completion_date)}
                    {overdue && ' · Overdue'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Strategic Findings ───────────────────────────────────────────────────────

interface Finding {
  id: string;
  severity: 'critical' | 'medium';
  title: string;
  description: string;
}

function deriveFindings(scores: Record<string, number>): Finding[] {
  const findings: Finding[] = [];

  for (const key of DEPT_ORDER) {
    const score = scores[key] ?? 0;
    if (score < 45) {
      const name = DEPT_DISPLAY_NAMES[key];
      findings.push({
        id: `critical-${key}`,
        severity: 'critical',
        title: `${name} — Critical Performance Gap`,
        description: `${name} scored ${Math.round(score)}/100 (Foundational). Core processes are undefined or inconsistently applied, creating a significant drag on overall dealership performance. Immediate structured intervention is required before the next assessment cycle.`,
      });
    }
  }

  const weakDepts = DEPT_ORDER.filter(k => (scores[k] ?? 0) < 65);
  if (weakDepts.length >= 2) {
    const names = weakDepts.map(k => DEPT_DISPLAY_NAMES[k]).join(', ');
    findings.push({
      id: 'systemic-process',
      severity: 'medium',
      title: 'Cross-Department Process Consistency Gap',
      description: `Below-benchmark performance identified in ${weakDepts.length} departments: ${names}. This pattern suggests an organisation-wide process discipline issue — likely inconsistent CRM usage, role ownership gaps, or absence of a regular operational review cadence — rather than isolated department failures.`,
    });
  }

  return findings.slice(0, 3);
}

function FindingsCard({ scores }: { scores: Record<string, number> }) {
  const findings = deriveFindings(scores);
  if (findings.length === 0) return null;

  return (
    <>
      <h2 className="text-[15px] font-bold text-[#172B4D]">Strategic Findings</h2>
      <div className="bg-white rounded-xl shadow-card border border-[#DFE1E6] px-5 py-5">
        {findings.map((f, i) => (
          <div
            key={f.id}
            className={cn('py-4 flex items-start gap-3', i > 0 && 'border-t border-[#F1F2F4]')}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                f.severity === 'critical' ? 'bg-[#fef2f2]' : 'bg-[#E9F2FF]'
              )}
            >
              {f.severity === 'critical' ? (
                <AlertCircle size={16} strokeWidth={2} className="text-[#ef4444]" />
              ) : (
                <Info size={16} strokeWidth={2} className="text-[#1D7AFC]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className="text-[13px] font-bold text-[#172B4D]">{f.title}</p>
                <span
                  className={cn(
                    'flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    f.severity === 'critical'
                      ? 'bg-[#fef2f2] text-[#ef4444]'
                      : 'bg-[#E9F2FF] text-[#1558BC]'
                  )}
                >
                  {f.severity === 'critical' ? 'Critical risk' : 'Medium impact'}
                </span>
              </div>
              <p className="text-[11px] text-[#5E6C84] leading-relaxed">{f.description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
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
  const { actorType, dealerId } = useActiveRole();
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

      let coach: CoachRow | null = null;
      if (dealerId) {
        const { data: coachRows } = await supabase
          .from('coach_dealership_assignments')
          .select('coach_user_id, assigned_at, valid_from, valid_to, is_active')
          .eq('dealership_id', dealerId)
          .eq('is_active', true)
          .limit(1);
        coach = (coachRows?.[0] as CoachRow) ?? null;
      }

      if (cancelled) return;

      setData({
        assessment,
        actions: (actions ?? []) as ActionRow[],
        coach,
      });
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user, dealerId]);

  const derived = useMemo(() => {
    if (!data) return null;
    const { assessment, actions } = data;
    const scores = (assessment.scores as Record<string, number>) ?? {};
    const overallScore = assessment.overall_score ?? calculateWeightedScore(scores);
    const maturityLabel = MATURITY_LEVELS[getMaturityLevel(overallScore)].label;
    const focusDeptKey = focusDepartment(scores);
    const focusDeptName = DEPT_DISPLAY_NAMES[focusDeptKey] ?? '—';
    const focusDeptScore = scores[focusDeptKey] ?? 0;
    const gapCount = criticalGapCount(scores);
    const openCount = actions.length;
    const narrative = heroNarrative(scores, overallScore);
    const quarter = quarterLabel(assessment.completed_at);

    return {
      overallScore, maturityLabel,
      focusDeptKey, focusDeptName, focusDeptScore,
      gapCount, openCount, narrative, quarter,
      scores,
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
    overallScore, maturityLabel,
    focusDeptKey, focusDeptName, focusDeptScore,
    gapCount, openCount, narrative, quarter,
    scores,
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
          <Button
            variant="default"
            onClick={() => navigate('/app/results')}
            className="flex items-center gap-2 bg-[#0b1f3a] hover:bg-[#122a4a] text-white text-[12px] font-semibold"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 2v8M5 7l3 3 3-3M3 13h10"/></svg>
            View Full Report
          </Button>
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

        {/* ── Timeline strip ── */}
        <TimelineStrip assessment={assessment} coach={coach} />

        {/* ── Priority card — only when a critical gap exists ── */}
        {gapCount > 0 && (
          <PriorityCard
            focusDeptName={focusDeptName}
            focusDeptScore={focusDeptScore}
            quarter={quarter}
          />
        )}

        {/* ── Departmental intelligence ── */}
        <DeptGrid scores={scores} />

        {/* ── Open actions table ── */}
        <ActionsTable
          actions={actions}
          onViewAll={() => navigate('/app/actions')}
        />

        {/* ── Strategic findings ── */}
        <FindingsCard scores={scores} />

      </main>
    </div>
  );
}
