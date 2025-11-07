# Project Images Implementation

This document describes the secure project images handling system implemented for the portfolio website.

## Overview

The system allows admins to upload, manage, and delete project images using the Supabase `project_images` storage bucket. Each project can have between 1 and 7 images, with one designated as the primary/thumbnail image.

## Key Features

- **Secure Upload**: File type and size validation on every upload
- **Image Limit**: Maximum 7 images per project (enforced)
- **Primary Image**: One image can be set as primary/thumbnail
- **Bucket Cleanup**: Automatic deletion from storage when admin removes images
- **Validation Rules**: Only JPG, PNG, and WebP files up to 5MB each
- **Real-time UI**: Live preview and management interface

## Technical Implementation

### 1. Service Layer (`src/services/projectImages.ts`)

The `ProjectImagesService` class provides:

#### Methods:
- `validateImageFile(file)` - Validates file type and size
- `getProjectImageCount(projectId)` - Returns current image count
- `getProjectImages(projectId)` - Retrieves all images for a project
- `uploadProjectImage(file, projectId, isPrimary)` - Uploads single image
- `uploadMultipleProjectImages(files, projectId)` - Batch upload
- `deleteProjectImage(imageId)` - Deletes image from storage and database
- `setPrimaryImage(imageId)` - Sets an image as primary thumbnail
- `getPrimaryImage(projectId)` - Gets the primary/thumbnail image
- `deleteAllProjectImages(projectId)` - Cleanup all images (used when deleting project)

#### Validation Rules:
```typescript
MAX_IMAGES = 7
MAX_FILE_SIZE = 5MB
ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
BUCKET_NAME = 'project_images'
```

#### Upload Process:
1. Validate file type and size
2. Check project exists
3. Verify image count limit
4. Generate unique filename: `project-{projectId}-{timestamp}.{ext}`
5. Upload to `project_images` bucket
6. Get public URL
7. If primary, unset other primary images
8. Insert record into `project_images` table
9. On failure, cleanup uploaded file
10. Log upload to audit trail

#### Delete Process:
1. Fetch image details from database
2. Delete from storage bucket
3. Delete from database
4. If deleted image was primary, set another image as primary
5. Log deletion to audit trail

### 2. UI Component (`src/components/admin/ProjectImagesManager.tsx`)

React component providing:

#### Features:
- Display all project images in grid layout
- Upload button with file selector (multiple files)
- Real-time count display (e.g., "3/7")
- Image preview with hover actions
- Set primary image (star icon)
- Delete image (X icon)
- Visual indicators for primary image
- Error and success notifications
- Guidelines and instructions

#### User Experience:
- Disabled upload when limit reached
- Confirmation dialog before deletion
- Loading states during operations
- Clear visual feedback for all actions
- Responsive grid layout

### 3. Integration (`src/components/admin/SupabaseProjectEditor.tsx`)

The `ProjectImagesManager` is integrated into the project editor:
- Only shown for existing projects (not during creation)
- Appears after the media upload section
- Calls `onSave` callback when images change to refresh data
- Wrapped in styled container for visual separation

### 4. Storage Service Updates (`src/services/storage.ts`)

Updated to use `project_images` bucket:
- `validateProjectImage()` - Validation helper
- `uploadProjectImage()` - Uses correct bucket
- Proper path handling for cleanup

### 5. Projects Service Updates (`src/services/projects.ts`)

Updated cleanup logic:
- `deleteProject()` - Correctly references `project_images` bucket
- `deleteProjectMedia()` - Fixed path handling
- Proper cascade deletion

## Storage Bucket Configuration

The `project_images` bucket is configured in:
`supabase/migrations/20251014184917_create_storage_buckets.sql`

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project_images',
  'project_images',
  true,
  10485760, -- 10MB in bytes (bucket limit)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
);
```

Note: Service enforces 5MB limit per file, bucket allows up to 10MB.

## Database Schema

The `project_images` table stores:
```
- id (uuid, primary key)
- project_id (uuid, foreign key to projects)
- image_path (text) - filename in bucket
- image_url (text) - public URL
- is_primary (boolean) - thumbnail flag
- type (text) - 'image' or 'video'
- created_at (timestamp)
- uploader_id (uuid) - for audit trail
```

## Security Considerations

1. **File Validation**: All uploads validated before storage
2. **Size Limits**: 5MB per file enforced
3. **Type Restrictions**: Only image formats allowed
4. **Count Limits**: Maximum 7 images per project
5. **Atomic Operations**: Database + storage cleanup on failure
6. **Audit Logging**: All uploads and deletions logged
7. **Public Access**: Bucket is public (read-only for images)

## Usage Instructions

### For Admins:

1. **Upload Images**:
   - Edit an existing project
   - Scroll to "Project Images" section
   - Click "Upload Images" button
   - Select 1-7 images (JPG, PNG, or WebP, max 5MB each)
   - Images upload automatically

2. **Set Primary Image**:
   - Hover over any image
   - Click the star icon
   - That image becomes the thumbnail

3. **Delete Image**:
   - Hover over any image
   - Click the X icon
   - Confirm deletion
   - Image removed from storage and database

### Guidelines:

- Upload images in order of importance
- First uploaded image is automatically primary
- Use high-quality images for better presentation
- Delete unused images to save storage space
- Keep image count under limit (7 max)

## Important Notes

⚠️ **Do NOT modify existing project images**
- The system only applies to NEW or EDITED projects
- Existing project images are preserved
- No automatic migration of old data

⚠️ **Manual deletions require cleanup**
- If admin manually deletes from storage bucket, also remove from database
- Use the delete button in UI for proper cleanup

⚠️ **Primary image management**
- Always one primary image if images exist
- When deleting primary, another image is automatically promoted
- When uploading to empty project, first image becomes primary

## Testing Checklist

- [ ] Upload single image
- [ ] Upload multiple images (2-7)
- [ ] Attempt to upload 8+ images (should fail)
- [ ] Upload invalid file type (should fail)
- [ ] Upload file > 5MB (should fail)
- [ ] Set different image as primary
- [ ] Delete non-primary image
- [ ] Delete primary image (another should become primary)
- [ ] Delete all images
- [ ] Upload after deletion
- [ ] Verify storage cleanup after deletion
- [ ] Check audit logs for uploads/deletions

## Future Enhancements

Potential improvements:
- Image optimization/compression before upload
- Drag-and-drop reordering
- Bulk operations (select multiple, delete all)
- Image metadata (alt text, captions)
- Image cropping/editing tools
- CDN integration for faster loading
