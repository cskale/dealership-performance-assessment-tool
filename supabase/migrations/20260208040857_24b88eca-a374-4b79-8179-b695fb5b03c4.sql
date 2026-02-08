-- Add updated_at column to improvement_actions for P1.3 conflict detection
ALTER TABLE public.improvement_actions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing rows to have updated_at = created_at
UPDATE public.improvement_actions 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Create trigger to auto-update updated_at on modification
CREATE OR REPLACE FUNCTION public.update_improvement_actions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_improvement_actions_updated_at ON public.improvement_actions;

CREATE TRIGGER trigger_update_improvement_actions_updated_at
  BEFORE UPDATE ON public.improvement_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_improvement_actions_updated_at();