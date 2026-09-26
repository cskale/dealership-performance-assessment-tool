import { Link } from 'react-router-dom';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import { questionnaire, isDataQuestion } from '@/data/questionnaire';
import type { TimelinePoint } from '@/lib/kpiTimeline';
import { useLanguage } from '@/contexts/LanguageContext';

interface LinkedKpiChipProps {
  kpiKey?: string;
  history?: TimelinePoint[];
}

const KPI_QUESTIONS = questionnaire.sections
  .flatMap((section) => section.questions)
  .filter(isDataQuestion);

export function LinkedKpiChip({ kpiKey, history = [] }: LinkedKpiChipProps) {
  const { t, language } = useLanguage();
  if (!kpiKey) return null;

  const question = KPI_QUESTIONS.find((candidate) => candidate.kpiKey === kpiKey);
  const label = question?.translations?.[language]?.text ?? question?.text ?? kpiKey;

  return (
    <Link
      to={`/app/knowledge/kpi/${encodeURIComponent(kpiKey)}`}
      onClick={(event) => event.stopPropagation()}
      className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-md border border-brand-200 bg-brand-50 px-2 text-[11px] font-medium text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-100"
      aria-label={`${t('actionPlan.viewKpi')}: ${label}`}
    >
      <Activity className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span className="max-w-32 truncate">{label}</span>
      {history.length > 1 && (
        <span className="h-4 w-12 shrink-0" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history.slice(-8)}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--brand-600))"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </span>
      )}
    </Link>
  );
}