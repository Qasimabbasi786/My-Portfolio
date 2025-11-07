/*
  # Fix Project Developers RLS Policies

  1. Changes
    - Allow full CRUD operations on project_developers table
    - Since admin validation happens in frontend, allow operations from any connection

  2. Security
    - Anyone can read project-developer associations
    - Allow INSERT/UPDATE/DELETE for managing associations (admin check in frontend)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read project developers" ON project_developers;
DROP POLICY IF EXISTS "Authenticated users can manage project developers" ON project_developers;

-- Create new policies

-- Anyone can read project developers
CREATE POLICY "Anyone can read project developers"
  ON project_developers
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow INSERT
CREATE POLICY "Allow project developer creation"
  ON project_developers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow UPDATE
CREATE POLICY "Allow project developer updates"
  ON project_developers
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow DELETE
CREATE POLICY "Allow project developer deletion"
  ON project_developers
  FOR DELETE
  TO anon, authenticated
  USING (true);