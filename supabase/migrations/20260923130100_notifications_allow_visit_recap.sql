-- visit_recap notifications (coach_visit_loop) were rejected by the type check,
-- which would have aborted every visit-log save.
ALTER TABLE public.notifications DROP CONSTRAINT notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type = ANY (ARRAY['stale_action', 'milestone', 'digest', 'coach_comment', 'google_review_alert', 'visit_recap']));
