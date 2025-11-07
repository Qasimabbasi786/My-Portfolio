/*
  # Add display_order column to developers table

  1. Changes
    - Add display_order column to developers table for manual ordering
    - Set default value to 0
    - Create index for better performance

  2. Notes
    - This allows admins to manually control the order of developers in the UI
*/

-- Add display_order column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'developers' AND column_name = 'display_order') THEN
    ALTER TABLE developers ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_developers_display_order ON developers(display_order);

-- Set display_order for existing developers based on created_at
UPDATE developers 
SET display_order = subquery.row_num 
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num 
  FROM developers
) AS subquery
WHERE developers.id = subquery.id AND developers.display_order = 0;
