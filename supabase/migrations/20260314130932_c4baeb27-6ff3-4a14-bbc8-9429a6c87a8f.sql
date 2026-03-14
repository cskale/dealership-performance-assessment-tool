CREATE OR REPLACE FUNCTION public.update_action_if_unchanged(
  p_id UUID,
  p_expected_updated_at TIMESTAMPTZ,
  p_title TEXT,
  p_description TEXT,
  p_status TEXT,
  p_priority TEXT,
  p_responsible_person TEXT,
  p_target_completion_date DATE,
  p_updated_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_updated_at TIMESTAMPTZ;
BEGIN
  SELECT updated_at INTO v_current_updated_at
  FROM improvement_actions
  WHERE id = p_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'conflict', false, 'error', 'not_found');
  END IF;

  IF v_current_updated_at != p_expected_updated_at THEN
    RETURN jsonb_build_object(
      'success', false, 
      'conflict', true, 
      'current_updated_at', v_current_updated_at
    );
  END IF;

  UPDATE improvement_actions SET
    action_title = p_title,
    action_description = p_description,
    status = p_status,
    priority = p_priority,
    responsible_person = p_responsible_person,
    target_completion_date = p_target_completion_date,
    updated_at = p_updated_at
  WHERE id = p_id;

  RETURN jsonb_build_object('success', true, 'conflict', false);
END;
$$;