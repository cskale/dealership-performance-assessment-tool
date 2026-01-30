-- Fix RLS Policies for Multi-User Support
-- This migration ensures proper data isolation between users

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can create own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can update own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can delete own assessments" ON assessments;

DROP POLICY IF EXISTS "Users can view own action plans" ON action_plans;
DROP POLICY IF EXISTS "Users can create own action plans" ON action_plans;
DROP POLICY IF EXISTS "Users can update own action plans" ON action_plans;
DROP POLICY IF EXISTS "Users can delete own action plans" ON action_plans;

DROP POLICY IF EXISTS "Users can view own progress" ON progress_tracking;
DROP POLICY IF EXISTS "Users can create own progress" ON progress_tracking;
DROP POLICY IF EXISTS "Users can update own progress" ON progress_tracking;
DROP POLICY IF EXISTS "Users can delete own progress" ON progress_tracking;

-- Create comprehensive RLS policies for assessments
CREATE POLICY "Users can view own assessments"
  ON assessments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assessments"
  ON assessments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
  ON assessments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessments"
  ON assessments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for action_plans
CREATE POLICY "Users can view own action plans"
  ON action_plans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own action plans"
  ON action_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own action plans"
  ON action_plans
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own action plans"
  ON action_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for progress_tracking
CREATE POLICY "Users can view own progress"
  ON progress_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress"
  ON progress_tracking
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON progress_tracking
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON progress_tracking
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add index for better query performance on user_id columns
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_user_id ON action_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_assessment_id ON action_plans(assessment_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_user_id ON progress_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_assessment_id ON progress_tracking(assessment_id);

-- Ensure assessment_id foreign key constraint exists
ALTER TABLE action_plans 
  DROP CONSTRAINT IF EXISTS action_plans_assessment_id_fkey;

ALTER TABLE action_plans 
  ADD CONSTRAINT action_plans_assessment_id_fkey 
  FOREIGN KEY (assessment_id) 
  REFERENCES assessments(id) 
  ON DELETE CASCADE;

-- Comments for documentation
COMMENT ON POLICY "Users can view own assessments" ON assessments IS 
  'Users can only view their own assessment records';
COMMENT ON POLICY "Users can view own action plans" ON action_plans IS 
  'Users can only view their own action plan items';
COMMENT ON POLICY "Users can view own progress" ON progress_tracking IS 
  'Users can only view their own progress tracking records';
