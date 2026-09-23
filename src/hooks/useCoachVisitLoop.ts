import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Data layer for the coach visit loop: pre-visit brief (coach + dealer),
 * review of previously agreed actions, dealer visit history, OEM coaching stats.
 * DB side: supabase/migrations/20260923130000_coach_visit_loop.sql.
 */

export type ReviewOutcome = 'done' | 'in_progress' | 'blocked' | 'not_started';

export interface BriefAction {
  id: string;
  title: string;
  department: string;
  priority: string;
  status: 'Open' | 'In Progress' | 'Completed';
  responsible_person: string | null;
  target_completion_date: string | null;
  last_review: { outcome: ReviewOutcome; note: string | null; reviewed_at: string } | null;
}

export interface OverdueAction {
  id: string;
  title: string;
  priority: string;
  responsible_person: string | null;
  target_completion_date: string;
  days_overdue: number;
}

export interface VisitBrief {
  last_visit: {
    id: string;
    visit_date: string;
    visit_type: string | null;
    summary: string | null;
    modules_reviewed: string[];
    next_visit_date: string | null;
  } | null;
  days_since_last_visit: number | null;
  agreed_actions: BriefAction[];
  score: {
    current: number | null;
    current_assessed_at: string | null;
    at_last_visit: number | null;
    at_last_visit_assessed_at: string | null;
    /** null when there is no newer assessment since the last visit */
    delta: number | null;
    departments_current: Record<string, number> | null;
    departments_at_last_visit: Record<string, number> | null;
  };
  completed_since_last_visit: number;
  overdue_count: number;
  overdue_actions: OverdueAction[];
  stale_count: number;
}

export interface VisitHistoryItem {
  id: string;
  visit_date: string;
  visit_type: string | null;
  summary: string | null;
  modules_reviewed: string[];
  next_visit_date: string | null;
  agreed_actions: { id: string; action_title: string; status: string; responsible_person: string | null; target_completion_date: string | null }[];
  reviews: { action_id: string; outcome: ReviewOutcome; note: string | null }[];
}

export interface CoachingStatsRow {
  dealership_id: string;
  dealership_name: string;
  last_visit_date: string | null;
  days_since_last_visit: number | null;
  visits_last_90d: number;
  agreed_actions: number;
  agreed_actions_completed: number;
  agreed_completion_rate: number | null;
}

const STALE = 5 * 60 * 1000;

/** A. Pre-visit brief for one dealership. Works for the assigned coach, dealer members and network OEM. */
export function useVisitBrief(dealershipId: string | null | undefined) {
  return useQuery({
    queryKey: ['visit-brief', dealershipId],
    enabled: !!dealershipId,
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_visit_brief', { p_dealership_id: dealershipId! });
      if (error) throw error;
      return data as unknown as VisitBrief;
    },
  });
}

/** D. Completed visits for a dealership, newest first, with agreed actions and review outcomes. */
export function useVisitHistory(dealershipId: string | null | undefined) {
  return useQuery({
    queryKey: ['visit-history', dealershipId],
    enabled: !!dealershipId,
    staleTime: STALE,
    queryFn: async (): Promise<VisitHistoryItem[]> => {
      const { data: visits, error } = await supabase
        .from('coach_visits')
        .select('id, visit_date, visit_type, summary, modules_reviewed, next_visit_date, agreed_action_ids')
        .eq('dealership_id', dealershipId!)
        .eq('status', 'completed')
        .order('visit_date', { ascending: false });
      if (error) throw error;
      if (!visits?.length) return [];

      // Two flat queries instead of embedded joins (see CLAUDE.md "Supabase Join Syntax").
      const actionIds = [...new Set(visits.flatMap(v => v.agreed_action_ids ?? []))];
      const [actionsRes, reviewsRes] = await Promise.all([
        actionIds.length
          ? supabase.from('improvement_actions')
              .select('id, action_title, status, responsible_person, target_completion_date')
              .in('id', actionIds)
          : Promise.resolve({ data: [], error: null }),
        supabase.from('visit_action_reviews')
          .select('visit_id, action_id, outcome, note')
          .in('visit_id', visits.map(v => v.id)),
      ]);
      if (actionsRes.error) throw actionsRes.error;
      if (reviewsRes.error) throw reviewsRes.error;

      const actionsById = new Map((actionsRes.data ?? []).map(a => [a.id, a]));
      return visits.map(v => ({
        id: v.id,
        visit_date: v.visit_date,
        visit_type: v.visit_type,
        summary: v.summary,
        modules_reviewed: v.modules_reviewed ?? [],
        next_visit_date: v.next_visit_date,
        agreed_actions: (v.agreed_action_ids ?? []).flatMap(id => actionsById.get(id) ?? []),
        reviews: (reviewsRes.data ?? [])
          .filter(r => r.visit_id === v.id)
          .map(r => ({ action_id: r.action_id, outcome: r.outcome as ReviewOutcome, note: r.note })),
      }));
    },
  });
}

/**
 * B. Save the coach's review of previously agreed actions for a visit.
 * 'done' marks the action Completed, 'in_progress' marks it In Progress (DB trigger).
 * Upserts, so re-saving the same visit edits the review rather than duplicating it.
 */
export function useSaveVisitReviews(dealershipId: string | null | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ visitId, reviews }: {
      visitId: string;
      reviews: { actionId: string; outcome: ReviewOutcome; note?: string }[];
    }) => {
      if (!reviews.length) return;
      const { error } = await supabase.from('visit_action_reviews').upsert(
        reviews.map(r => ({
          visit_id: visitId,
          action_id: r.actionId,
          outcome: r.outcome,
          note: r.note?.trim() || null,
        })),
        { onConflict: 'visit_id,action_id' },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visit-brief', dealershipId] });
      queryClient.invalidateQueries({ queryKey: ['visit-history', dealershipId] });
    },
  });
}

/** F. Per-dealership coaching effectiveness for the caller's OEM network (least recently visited first). */
export function useNetworkCoachingStats(enabled = true) {
  return useQuery({
    queryKey: ['network-coaching-stats'],
    enabled,
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_network_coaching_stats');
      if (error) throw error;
      return (data ?? []) as CoachingStatsRow[];
    },
  });
}
