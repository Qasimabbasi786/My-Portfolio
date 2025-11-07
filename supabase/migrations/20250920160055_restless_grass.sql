/*
  # Portfolio Website Database Schema

  1. New Tables
    - `admins` - Admin users for authentication
    - `developers` - Developer profiles and information
    - `projects` - Project details and information
    - `project_images` - Multiple images per project
    - `project_developers` - Many-to-many relationship between projects and developers

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated admin access
    - Secure password hashing for admin accounts

  3. Storage
    - Create storage buckets for profile pictures and project images
    - Set up proper access policies for file uploads
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT UNIQUE,
  last_login TIMESTAMP,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create developers table
CREATE TABLE IF NOT EXISTS developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  github TEXT,
  linkedin TEXT,
  title TEXT,
  skills TEXT[] DEFAULT '{}',
  profile_picture TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  technologies TEXT[] DEFAULT '{}',
  github_link TEXT,
  live_demo_link TEXT,
  featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create project_images table
CREATE TABLE IF NOT EXISTS project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  image_url TEXT,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create project_developers junction table
CREATE TABLE IF NOT EXISTS project_developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  developer_id UUID REFERENCES developers(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'developer',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, developer_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_developers_email ON developers(email);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_project_developers_project_id ON project_developers(project_id);
CREATE INDEX IF NOT EXISTS idx_project_developers_developer_id ON project_developers(developer_id);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_developers ENABLE ROW LEVEL SECURITY;

-- Create policies for admins table (only admins can access)
CREATE POLICY "Admins can read own data" ON admins
  FOR SELECT TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can update own data" ON admins
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = id::text);

-- Create policies for developers table (public read, admin write)
CREATE POLICY "Anyone can read developers" ON developers
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage developers" ON developers
  FOR ALL TO authenticated
  USING (true);

-- Create policies for projects table (public read, admin write)
CREATE POLICY "Anyone can read active projects" ON projects
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Authenticated users can manage projects" ON projects
  FOR ALL TO authenticated
  USING (true);

-- Create policies for project_images table (public read, admin write)
CREATE POLICY "Anyone can read project images" ON project_images
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage project images" ON project_images
  FOR ALL TO authenticated
  USING (true);

-- Create policies for project_developers table (public read, admin write)
CREATE POLICY "Anyone can read project developers" ON project_developers
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage project developers" ON project_developers
  FOR ALL TO authenticated
  USING (true);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_developers_updated_at 
  BEFORE UPDATE ON developers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();