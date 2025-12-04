-- Remove old constraint if it exists
ALTER TABLE improvement_actions DROP CONSTRAINT IF EXISTS improvement_actions_priority_check;

-- Add new constraint with lowercase values
ALTER TABLE improvement_actions 
ADD CONSTRAINT improvement_actions_priority_check 
CHECK (priority IN ('critical', 'high', 'medium', 'low'));