/*
  # Add display_order column to projects table

  1. Changes
    - Add display_order column to projects table for manual ordering
    - Set default value to 0
    - Create index for better performance

  2. Notes
    - This allows admins to manually control the order of projects in the UI
*/

-- Add display_order column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'display_order') THEN
    ALTER TABLE projects ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(display_order);

-- Set display_order for existing projects based on created_at
UPDATE projects 
SET display_order = subquery.row_num 
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num 
  FROM projects
) AS subquery
WHERE projects.id = subquery.id AND projects.display_order = 0;