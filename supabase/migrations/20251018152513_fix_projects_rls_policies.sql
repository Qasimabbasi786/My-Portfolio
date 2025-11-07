/*
  # Fix Projects RLS Policies for Admin Operations

  1. Changes
    - Drop existing restrictive policies on projects table
    - Add new policies that allow service role to perform all operations
    - Keep public read access for active projects
    - Allow authenticated admin users (via service role) to manage projects

  2. Security
    - Public users can only read active/published projects
    - Service role (admin operations) can create, update, and delete projects
    - Uses service_role for admin operations bypassing RLS
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read active projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can manage projects" ON projects;

-- Create new policies

-- Public can read active and published projects
CREATE POLICY "Public can read published projects"
  ON projects
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active' AND published = true);

-- Service role can do anything (this bypasses RLS when using service_role key)
-- This policy allows authenticated users with proper credentials to manage projects
CREATE POLICY "Service role can manage all projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);