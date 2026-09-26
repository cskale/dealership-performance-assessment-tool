import { useMemo, useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { isDataQuestion, questionnaire } from '@/data/questionnaire';
import { useActiveRole } from '@/hooks/useActiveRole';
import { useSaveKpiCheckin } from '@/hooks/useKpiTimeline';

interface KpiCheckinControlProps {
  kpiKey: string;
  value: number | null;
}

const LOCALES: Record<Language, string> = {
  en: 'en-GB',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  it: 'it-IT',
};

const KPI_QUESTIONS = questionnaire.sections
  .flatMap((section) => section.questions)
  .filter(isDataQuestion);

function previousMonthValue(): string {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function currentMonthValue(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(month: string, locale: string): string {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString(locale, {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  });
}

export function KpiCheckinControl({ kpiKey, value }: KpiCheckinControlProps) {
  const { t, language } = useLanguage();
  const { actorType, membershipRole, dealerId } = useActiveRole();
  const saveCheckin = useSaveKpiCheckin(dealerId);
  const [month, setMonth] = useState(previousMonthValue);
  const [saveError, setSaveError] = useState('');
  const question = KPI_QUESTIONS.find((candidate) => candidate.kpiKey === kpiKey);
  const maxMonth = currentMonthValue();
  const canLog = Boolean(dealerId) && (
    actorType === 'coach' || (
      actorType === 'dealer' && membershipRole !== null && membershipRole !== 'viewer'
    )
  );

  const validation = useMemo(() => z.number()
    .finite()
    .min(question?.validRange?.min ?? 0)
    .max(question?.validRange?.max ?? Number.MAX_SAFE_INTEGER)
    .safeParse(value), [question, value]);

  if (!canLog || !question) return null;

  const min = question.validRange?.min ?? 0;
  const max = question.validRange?.max ?? Number.MAX_SAFE_INTEGER;
  const rangeError = value !== null && !validation.success
    ? t('kpi.invalidRange').replace('{min}', String(min)).replace('{max}', String(max))
    : '';

  const save = async () => {
    if (!validation.success || !month || month > maxMonth) return;
    setSaveError('');
    try {
      await saveCheckin.mutateAsync({
        kpiKey,
        month: `${month}-01`,
        value: validation.data,
      });
      toast.success(t('kpi.saved'));
    } catch {
      setSaveError(t('common.error'));
    }
  };

  return (
    <div className="min-w-0 space-y-1.5">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          type="month"
          value={month}
          max={maxMonth}
          onChange={(event) => {
            setMonth(event.target.value);
            setSaveError('');
          }}
          className="h-8 w-full text-xs sm:w-36"
          aria-label={t('kpi.logMonth').replace('{month}', formatMonth(`${month || maxMonth}`, LOCALES[language]))}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-w-0 gap-1.5 text-xs"
          disabled={!validation.success || !month || month > maxMonth || saveCheckin.isPending}
          onClick={save}
        >
          <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="truncate">
            {t('kpi.saveAsCheckin').replace('{month}', formatMonth(month || maxMonth, LOCALES[language]))}
          </span>
        </Button>
      </div>
      {(rangeError || saveError) && (
        <p role="alert" className="text-caption text-destructive">{rangeError || saveError}</p>
      )}
    </div>
  );
}