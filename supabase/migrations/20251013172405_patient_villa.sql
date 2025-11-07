/*
  # Add Missing Columns for Full Admin Panel Functionality

  1. Add missing columns to existing tables
    - Add thumbnail column to projects table
    - Add published column to projects table  
    - Add creator_id column to projects table
    - Add type column to project_images table
    - Add uploader_id column to project_images table

  2. Create indexes for better performance
  3. Update RLS policies if needed

  Note: This migration only adds missing columns without affecting existing data
*/

-- Add missing columns to projects table if they don't exist
DO $$ 
BEGIN
  -- Add thumbnail column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'thumbnail') THEN
    ALTER TABLE projects ADD COLUMN thumbnail TEXT;
  END IF;

  -- Add published column (maps to existing featured for now, but separate for clarity)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'published') THEN
    ALTER TABLE projects ADD COLUMN published BOOLEAN DEFAULT true;
  END IF;

  -- Add creator_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'creator_id') THEN
    ALTER TABLE projects ADD COLUMN creator_id UUID REFERENCES admins(id);
  END IF;
END $$;

-- Add missing columns to project_images table if they don't exist
DO $$ 
BEGIN
  -- Add type column for media type (image/video/thumbnail)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_images' AND column_name = 'type') THEN
    ALTER TABLE project_images ADD COLUMN type TEXT DEFAULT 'image' CHECK (type IN ('image', 'video', 'thumbnail'));
  END IF;

  -- Add uploader_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_images' AND column_name = 'uploader_id') THEN
    ALTER TABLE project_images ADD COLUMN uploader_id UUID REFERENCES admins(id);
  END IF;
END $$;

-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_creator_id ON projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_project_images_type ON project_images(type);
CREATE INDEX IF NOT EXISTS idx_project_images_uploader_id ON project_images(uploader_id);

-- Update existing projects to have published = true by default
UPDATE projects SET published = true WHERE published IS NULL;

-- Create function to automatically set creator_id and uploader_id
CREATE OR REPLACE FUNCTION set_creator_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to get admin ID from JWT claims or use first admin as fallback
  NEW.creator_id = COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'admin_id')::uuid,
    (SELECT id FROM admins LIMIT 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for projects
DROP TRIGGER IF EXISTS set_projects_creator_id ON projects;
CREATE TRIGGER set_projects_creator_id
  BEFORE INSERT ON projects
  FOR EACH ROW
  WHEN (NEW.creator_id IS NULL)
  EXECUTE FUNCTION set_creator_id();

-- Create function for project_images uploader_id
CREATE OR REPLACE FUNCTION set_uploader_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.uploader_id = COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'admin_id')::uuid,
    (SELECT id FROM admins LIMIT 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for project_images
DROP TRIGGER IF EXISTS set_project_images_uploader_id ON project_images;
CREATE TRIGGER set_project_images_uploader_id
  BEFORE INSERT ON project_images
  FOR EACH ROW
  WHEN (NEW.uploader_id IS NULL)
  EXECUTE FUNCTION set_uploader_id();