/*
  # Enhanced Portfolio Schema with pgcrypto

  1. Extensions
    - Enable pgcrypto for password hashing

  2. Enhanced Tables
    - Update admins table with proper password hashing
    - Add missing columns to existing tables
    - Create storage buckets and policies

  3. Security
    - Enhanced RLS policies
    - Admin authentication functions
    - Secure password handling
*/

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create admin authentication function
CREATE OR REPLACE FUNCTION authenticate_admin(username_input TEXT, password_input TEXT)
RETURNS TABLE(id UUID, username TEXT, email TEXT, authenticated BOOLEAN) 
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.username,
    a.email,
    (a.password = crypt(password_input, a.password)) as authenticated
  FROM admins a
  WHERE a.username = username_input;
END;
$$;

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN 
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins 
    WHERE username = current_setting('request.jwt.claims', true)::json->>'username'
  );
$$;

-- Add missing columns to existing tables if they don't exist
DO $$ 
BEGIN
  -- Add order column to projects for sorting
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'display_order') THEN
    ALTER TABLE projects ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;

  -- Add bio column to developers if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'developers' AND column_name = 'bio') THEN
    ALTER TABLE developers ADD COLUMN bio TEXT;
  END IF;

  -- Update admins table to use proper password hashing
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins') THEN
    -- Update existing admin password to use crypt if it's not already hashed
    UPDATE admins 
    SET password = crypt('StrongAdminPass123!', gen_salt('bf'))
    WHERE username = 'admin' AND length(password) < 50;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(display_order);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_developers_created_at ON developers(created_at DESC);

-- Enhanced RLS policies
DROP POLICY IF EXISTS "Anyone can read developers" ON developers;
DROP POLICY IF EXISTS "Authenticated users can manage developers" ON developers;
DROP POLICY IF EXISTS "Anyone can read active projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can manage projects" ON projects;

-- Public read access for developers
CREATE POLICY "Public read developers" ON developers
  FOR SELECT TO anon, authenticated
  USING (true);

-- Admin-only write access for developers
CREATE POLICY "Admin manage developers" ON developers
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Public read access for active projects
CREATE POLICY "Public read projects" ON projects
  FOR SELECT TO anon, authenticated
  USING (status = 'active' OR is_admin());

-- Admin-only write access for projects
CREATE POLICY "Admin manage projects" ON projects
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Enhanced policies for project_images
DROP POLICY IF EXISTS "Anyone can read project images" ON project_images;
DROP POLICY IF EXISTS "Authenticated users can manage project images" ON project_images;

CREATE POLICY "Public read project images" ON project_images
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admin manage project images" ON project_images
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Enhanced policies for project_developers
DROP POLICY IF EXISTS "Anyone can read project developers" ON project_developers;
DROP POLICY IF EXISTS "Authenticated users can manage project developers" ON project_developers;

CREATE POLICY "Public read project developers" ON project_developers
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admin manage project developers" ON project_developers
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create storage buckets (these need to be created via Supabase dashboard or API)
-- This is a comment for manual setup:
-- 1. Create 'avatars' bucket (public: true)
-- 2. Create 'projects' bucket (public: true)
-- 3. Set up CORS policies for file uploads

-- Seed enhanced admin user
INSERT INTO admins (username, password, email)
VALUES (
  'admin',
  crypt('StrongAdminPass123!', gen_salt('bf')),
  'qasim.abbasi81755@gmail.com'
)
ON CONFLICT (username) DO UPDATE SET
  password = crypt('StrongAdminPass123!', gen_salt('bf')),
  email = EXCLUDED.email;

-- Update existing developers with enhanced data
UPDATE developers 
SET 
  bio = CASE 
    WHEN name = 'Muhammad Qasim' THEN 'Experienced Full Stack Web Developer specializing in modern web technologies. I build robust, scalable applications with a focus on clean code and exceptional user experiences.'
    WHEN name = 'Azmat Mustafa' THEN 'Skilled Full Stack Web Developer with expertise in creating dynamic, responsive web applications. I combine technical proficiency with creative problem-solving to deliver outstanding digital solutions.'
    ELSE bio
  END,
  skills = CASE 
    WHEN name = 'Muhammad Qasim' THEN ARRAY['React', 'Node.js', 'TypeScript', 'Python', 'MongoDB', 'PostgreSQL', 'TailwindCSS', 'MySQL']
    WHEN name = 'Azmat Mustafa' THEN ARRAY['React', 'JavaScript', 'Node.js', 'Express.js', 'CSS', 'Tailwind CSS', 'MongoDB', 'Firebase', 'Git/GitHub']
    ELSE skills
  END
WHERE name IN ('Muhammad Qasim', 'Azmat Mustafa');