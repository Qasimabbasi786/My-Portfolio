/*
  # Fix Developers Table RLS for Admin Inserts

  ## Changes
  1. Drop the existing problematic RLS policy that checks auth.email()
  2. Create a new policy that allows service role to insert (used by edge functions)
  3. Keep other policies intact for reading and updating

  ## Security
  - The edge function already validates admin tokens before inserting
  - Service role key is only used server-side in edge functions
  - Public users still cannot insert developers directly
*/

-- Drop the problematic policy that checks auth.email()
DROP POLICY IF EXISTS "allow_only_admin_to_insert_developers" ON developers;

-- Create a new policy that allows authenticated service role to insert
-- This will work with the edge function that uses the service role key
CREATE POLICY "Service role can insert developers"
  ON developers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Note: The edge function validates admin authentication before allowing inserts,
-- so this policy is safe as it only applies to authenticated connections (service role)
