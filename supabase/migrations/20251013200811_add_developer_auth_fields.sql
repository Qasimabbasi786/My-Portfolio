/*
  # Add Authentication Fields to Developers Table

  ## Overview
  Updates the developers table to support direct email/password authentication for developer logins.

  ## Changes Made
  
  ### 1. New Columns
    - `password` (text, NOT NULL with default) - Stores hashed passwords for developer authentication
    - `github_link` (text, nullable) - Replaces the existing `github` field to match naming convention
  
  ### 2. Column Modifications
    - Makes `email` column NOT NULL to ensure all developers have login credentials
  
  ### 3. Data Migration
    - Copies existing `github` values to new `github_link` column
    - Sets default empty password hash for existing developers (must be updated by admin)
  
  ## Security Notes
  - Passwords should be hashed before storing (handled in application layer)
  - Email field is now required for all developer records
  - RLS policies remain unchanged - authentication is handled at application level
*/

-- Add password column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'developers' AND column_name = 'password'
  ) THEN
    ALTER TABLE developers ADD COLUMN password text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Add github_link column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'developers' AND column_name = 'github_link'
  ) THEN
    ALTER TABLE developers ADD COLUMN github_link text;
  END IF;
END $$;

-- Copy data from github to github_link if github_link is empty
UPDATE developers 
SET github_link = github 
WHERE github_link IS NULL AND github IS NOT NULL;

-- Make email NOT NULL if it isn't already
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'developers' 
    AND column_name = 'email' 
    AND is_nullable = 'YES'
  ) THEN
    -- First set empty string for any null emails
    UPDATE developers SET email = '' WHERE email IS NULL;
    -- Then make column NOT NULL
    ALTER TABLE developers ALTER COLUMN email SET NOT NULL;
  END IF;
END $$;