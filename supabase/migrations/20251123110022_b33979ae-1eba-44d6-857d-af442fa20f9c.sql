-- Add new columns to improvement_actions table for Action Plan functionality
ALTER TABLE improvement_actions 
ADD COLUMN IF NOT EXISTS responsible_person TEXT,
ADD COLUMN IF NOT EXISTS target_completion_date DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Completed')),
ADD COLUMN IF NOT EXISTS support_required_from TEXT[],
ADD COLUMN IF NOT EXISTS kpis_linked_to TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN improvement_actions.responsible_person IS 'Person responsible for the action (e.g., Dealer Principal, Aftersales Manager)';
COMMENT ON COLUMN improvement_actions.target_completion_date IS 'Target date for completing the action';
COMMENT ON COLUMN improvement_actions.status IS 'Current status: Open, In Progress, or Completed';
COMMENT ON COLUMN improvement_actions.support_required_from IS 'Array of support sources needed (e.g., Coach, IT Team, OEM)';
COMMENT ON COLUMN improvement_actions.kpis_linked_to IS 'Array of KPI categories linked to this action';