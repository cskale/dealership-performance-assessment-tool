-- Drop existing RLS policies on actions table
DROP POLICY IF EXISTS "Dealers can view their own actions" ON actions;
DROP POLICY IF EXISTS "Dealers can create actions for their dealership" ON actions;
DROP POLICY IF EXISTS "Dealers can update their own actions" ON actions;
DROP POLICY IF EXISTS "Coaches can delete any action" ON actions;

-- Create simpler RLS policies that allow all authenticated users
CREATE POLICY "Authenticated users can view all actions"
  ON actions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create actions"
  ON actions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update actions"
  ON actions
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete actions"
  ON actions
  FOR DELETE
  TO authenticated
  USING (true);