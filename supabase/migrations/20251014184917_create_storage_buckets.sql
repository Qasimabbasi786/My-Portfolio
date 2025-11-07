/*
  # Create Storage Buckets for Developer Profiles and Project Images

  1. New Buckets
    - `developer_profiles` - Storage for developer profile pictures
      - Public access enabled for easy retrieval
      - 5MB file size limit per image
      - Allowed types: image/jpeg, image/png, image/webp, image/gif
    
    - `project_images` - Storage for project-related pictures
      - Public access enabled for easy retrieval
      - 10MB file size limit per image
      - Allowed types: image/jpeg, image/png, image/webp, image/gif

  2. Security
    - RLS policies are managed by Supabase automatically for storage buckets
    - Public buckets allow read access to all users
    - Authenticated users can upload/manage files

  Note: This migration only creates the buckets.
  No existing data or logic is modified.
*/

-- Create developer_profiles bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'developer_profiles',
  'developer_profiles',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create project_images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project_images',
  'project_images',
  true,
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;
