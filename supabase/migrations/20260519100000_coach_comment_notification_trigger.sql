-- supabase/migrations/20260519100000_coach_comment_notification_trigger.sql

CREATE OR REPLACE FUNCTION public.notify_on_coach_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_rec   RECORD;
  org_id       UUID;
  note_preview TEXT;
BEGIN
  -- Resolve the organisation that owns this dealership
  SELECT organization_id INTO org_id
  FROM dealerships
  WHERE id = NEW.dealership_id;

  -- Guard: skip if dealership has no org (should never happen)
  IF org_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Truncate note to 120 chars for the notification body
  note_preview := left(NEW.note_text, 120);
  IF length(NEW.note_text) > 120 THEN
    note_preview := note_preview || '…';
  END IF;

  -- Insert one in_app notification per active owner/admin member
  FOR member_rec IN
    SELECT user_id
    FROM memberships
    WHERE organization_id = org_id
      AND is_active = true
      AND role IN ('owner', 'admin')
  LOOP
    INSERT INTO notifications
      (user_id, organization_id, type, channel, entity_type, entity_id, title, body)
    VALUES
      (member_rec.user_id,
       org_id,
       'coach_comment',
       'in_app',
       'coach_note',
       NEW.id,
       'New coach note',
       note_preview);
  END LOOP;

  RETURN NEW;
END;
$$;

-- Drop first in case of re-run
DROP TRIGGER IF EXISTS trg_coach_note_notification ON public.coach_notes;

CREATE TRIGGER trg_coach_note_notification
  AFTER INSERT ON public.coach_notes
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_coach_comment();
