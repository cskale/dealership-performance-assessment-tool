import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useOptionalLanguage } from '@/contexts/LanguageContext';

interface CoachNote {
  id: string;
  note_text: string;
  created_at: string;
  action_id: string | null;
  visit_id: string | null;
  profiles: { display_name: string | null; full_name: string | null } | null;
  actionTitle: string | null;
  visitDate: string | null;
}

interface CoachNotesPanelProps {
  dealershipId: string | null;
}

function timeAgo(dateStr: string, labels: { now: string; minutes: string; hours: string; days: string }): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return labels.now;
  if (mins < 60) return labels.minutes.replace('{count}', String(mins));
  const hours = Math.floor(mins / 60);
  if (hours < 24) return labels.hours.replace('{count}', String(hours));
  const days = Math.floor(hours / 24);
  return labels.days.replace('{count}', String(days));
}

function coachDisplayName(profiles: CoachNote['profiles'], fallback: string): string {
  return profiles?.display_name || profiles?.full_name || fallback;
}

export function CoachNotesPanel({ dealershipId }: CoachNotesPanelProps) {
  const navigate = useNavigate();
  const { t, language } = useOptionalLanguage();
  const [notes, setNotes] = useState<CoachNote[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!dealershipId) { setLoaded(true); return; }

    // Two queries: coach_notes has no FK to profiles, so an embedded join 400s.
    (async () => {
      const { data, error } = await supabase
        .from('coach_notes')
        .select('id, note_text, created_at, action_id, visit_id, coach_user_id')
        .eq('dealership_id', dealershipId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error || !data) { setLoaded(true); return; }

      const coachIds = [...new Set(data.map(n => n.coach_user_id))];
      const actionIds = [...new Set(data.flatMap(n => n.action_id ? [n.action_id] : []))];
      const visitIds = [...new Set(data.flatMap(n => n.visit_id ? [n.visit_id] : []))];
      const actionQuery = supabase.from('improvement_actions').select('id, action_title');
      const visitQuery = supabase.from('coach_visits').select('id, visit_date');
      const [{ data: profiles }, { data: actions }, { data: visits }] = await Promise.all([
        coachIds.length ? supabase.from('profiles').select('user_id, display_name, full_name').in('user_id', coachIds) : Promise.resolve({ data: [] }),
        actionIds.length && typeof actionQuery.in === 'function' ? actionQuery.in('id', actionIds) : Promise.resolve({ data: [] }),
        visitIds.length && typeof visitQuery.in === 'function' ? visitQuery.in('id', visitIds) : Promise.resolve({ data: [] }),
      ]);
      const byId = new Map((profiles ?? []).map(p => [p.user_id, p]));
      const actionsById = new Map((actions ?? []).map(action => [action.id, action.action_title]));
      const visitsById = new Map((visits ?? []).map(visit => [visit.id, visit.visit_date]));

      setNotes(data.map(n => ({
        ...n,
        profiles: byId.get(n.coach_user_id) ?? null,
        actionTitle: n.action_id ? actionsById.get(n.action_id) ?? null : null,
        visitDate: n.visit_id ? visitsById.get(n.visit_id) ?? null : null,
      })));
      setLoaded(true);
    })();
  }, [dealershipId]);

  const groups = useMemo(() => {
    const grouped = new Map<string, CoachNote[]>();
    for (const note of notes) {
      const key = note.visit_id ?? 'general';
      grouped.set(key, [...(grouped.get(key) ?? []), note]);
    }
    return [...grouped.entries()];
  }, [notes]);

  if (!dealershipId || !loaded || notes.length === 0) return null;

  return (
    <div id="coach-notes" className="overflow-hidden rounded-lg border border-border bg-card shadow-card">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="text-[13px] font-bold text-foreground">{t('dealerNotes.title')}</span>
        </div>
        <button
          onClick={() => navigate('/app/actions')}
          className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          {t('dealerNotes.viewActions')} <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Notes list */}
      <div className="divide-y divide-border">
        {groups.map(([groupId, groupNotes]) => (
          <section key={groupId} className="px-5 py-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {groupId === 'general'
                ? t('dealerNotes.general')
                : t('dealerNotes.visit').replace('{date}', groupNotes[0]?.visitDate ? new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : language, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(groupNotes[0].visitDate)) : '—')}
            </h3>
            <div className="space-y-4">
            {groupNotes.map((note) => (
          <article key={note.id}>
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="text-[11px] font-semibold text-foreground">
                {coachDisplayName(note.profiles, t('dealerNotes.coach'))}
              </span>
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {timeAgo(note.created_at, { now: t('time.justNow'), minutes: t('time.minutesAgo'), hours: t('time.hoursAgo'), days: t('time.daysAgo') })}
              </span>
            </div>
            <p className={cn(
               'text-[12px] leading-relaxed text-muted-foreground',
              note.note_text.length > 160 && 'line-clamp-3'
            )}>
              {note.note_text}
            </p>
            {note.action_id && (
              <button
                onClick={() => navigate(`/app/actions?action=${note.action_id}`)}
                className="mt-2 inline-flex items-center"
              >
                <Badge
                  variant="outline"
                   className="cursor-pointer border-primary/30 px-1.5 py-0 text-[10px] text-primary hover:bg-primary/5"
                >
                  {note.actionTitle ?? t('dealerNotes.linkedAction')} →
                </Badge>
              </button>
            )}
          </article>
        ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
