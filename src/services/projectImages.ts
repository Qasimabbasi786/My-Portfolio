import { supabase } from '../lib/supabase';
import { AuditLogger } from './auditLogger';

export interface ProjectImageUploadResult {
  success: boolean;
  data?: {
    id: string;
    url: string;
    path: string;
  };
  message?: string;
}

export interface ProjectImagesResult {
  success: boolean;
  data?: Array<{
    id: string;
    image_url: string;
    image_path: string;
    is_primary: boolean;
    created_at: string;
  }>;
  count?: number;
  message?: string;
}

export class ProjectImagesService {
  private static readonly MAX_IMAGES = 7;
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  private static readonly BUCKET_NAME = 'project_images';

  /**
   * Validate image file before upload
   */
  static validateImageFile(file: File): { valid: boolean; message?: string } {
    if (!file) {
      return {
        valid: false,
        message: 'No file provided'
      };
    }

    if (!this.ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return {
        valid: false,
        message: 'Invalid file type. Only JPG, PNG, and WebP files are allowed.'
      };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        message: 'File size exceeds 5MB limit.'
      };
    }

    return { valid: true };
  }

  /**
   * Get current image count for a project
   */
  static async getProjectImageCount(projectId: string): Promise<number> {
    const { count, error } = await supabase
      .from('project_images')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    if (error) {
      console.error('Error counting project images:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Get all images for a project
   */
  static async getProjectImages(projectId: string): Promise<ProjectImagesResult> {
    try {
      const { data, error, count } = await supabase
        .from('project_images')
        .select('id, image_url, image_path, is_primary, created_at', { count: 'exact' })
        .eq('project_id', projectId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Get project images error:', error);
        return {
          success: false,
          message: 'Failed to fetch project images'
        };
      }

      return {
        success: true,
        data: data || [],
        count: count || 0
      };
    } catch (error) {
      console.error('Get project images error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching project images'
      };
    }
  }

  /**
   * Upload a single project image
   */
  static async uploadProjectImage(
    file: File,
    projectId: string,
    isPrimary: boolean = false
  ): Promise<ProjectImageUploadResult> {
    try {
      // Validate file
      const validation = this.validateImageFile(file);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message
        };
      }

      // Check if project exists
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .maybeSingle();

      if (projectError || !project) {
        return {
          success: false,
          message: 'Project not found'
        };
      }

      // Check current image count
      const currentCount = await this.getProjectImageCount(projectId);
      if (currentCount >= this.MAX_IMAGES) {
        return {
          success: false,
          message: `Maximum of ${this.MAX_IMAGES} images allowed per project`
        };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const timestamp = Date.now();
      const fileName = `project-${projectId}-${timestamp}.${fileExt}`;
      const filePath = fileName;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return {
          success: false,
          message: `Upload failed: ${uploadError.message}`
        };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      // If this is set as primary, unset any existing primary images
      if (isPrimary) {
        await supabase
          .from('project_images')
          .update({ is_primary: false })
          .eq('project_id', projectId)
          .eq('is_primary', true);
      }

      // Insert into database
      const { data: imageRecord, error: dbError } = await supabase
        .from('project_images')
        .insert({
          project_id: projectId,
          image_path: filePath,
          image_url: publicUrl,
          is_primary: isPrimary,
          type: 'image'
        })
        .select('id, image_url, image_path')
        .single();

      if (dbError) {
        // Cleanup uploaded file if database insert fails
        await supabase.storage
          .from(this.BUCKET_NAME)
          .remove([filePath]);

        console.error('Database insert error:', dbError);
        return {
          success: false,
          message: 'Failed to save image record'
        };
      }

      // Log the upload
      await AuditLogger.logFileUpload(file.name, filePath, file.size);

      return {
        success: true,
        data: {
          id: imageRecord.id,
          url: imageRecord.image_url,
          path: imageRecord.image_path
        },
        message: 'Image uploaded successfully'
      };
    } catch (error) {
      console.error('Upload project image error:', error);
      return {
        success: false,
        message: 'An error occurred during upload'
      };
    }
  }

  /**
   * Upload multiple project images
   */
  static async uploadMultipleProjectImages(
    files: File[],
    projectId: string
  ): Promise<{ success: boolean; results: ProjectImageUploadResult[]; message?: string }> {
    try {
      if (!files || files.length === 0) {
        return {
          success: false,
          results: [],
          message: 'No files provided'
        };
      }

      // Check current count and validate total
      const currentCount = await this.getProjectImageCount(projectId);
      const totalCount = currentCount + files.length;

      if (totalCount > this.MAX_IMAGES) {
        return {
          success: false,
          results: [],
          message: `Cannot upload ${files.length} images. Maximum ${this.MAX_IMAGES} images allowed per project (currently ${currentCount})`
        };
      }

      // Upload each file
      const results: ProjectImageUploadResult[] = [];
      for (let i = 0; i < files.length; i++) {
        const result = await this.uploadProjectImage(
          files[i],
          projectId,
          i === 0 && currentCount === 0 // First image is primary if no images exist
        );
        results.push(result);
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      return {
        success: successCount > 0,
        results,
        message: `${successCount} image(s) uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ''}`
      };
    } catch (error) {
      console.error('Upload multiple images error:', error);
      return {
        success: false,
        results: [],
        message: 'An error occurred during upload'
      };
    }
  }

  /**
   * Delete a project image
   * Removes from both storage bucket and database
   */
  static async deleteProjectImage(imageId: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Get image details
      const { data: image, error: fetchError } = await supabase
        .from('project_images')
        .select('image_path, project_id, is_primary')
        .eq('id', imageId)
        .maybeSingle();

      if (fetchError || !image) {
        return {
          success: false,
          message: 'Image not found'
        };
      }

      // Delete from storage bucket
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([image.image_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('project_images')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        console.error('Database delete error:', dbError);
        return {
          success: false,
          message: 'Failed to delete image record'
        };
      }

      // If deleted image was primary, set another image as primary
      if (image.is_primary) {
        const { data: remainingImages } = await supabase
          .from('project_images')
          .select('id')
          .eq('project_id', image.project_id)
          .order('created_at', { ascending: true })
          .limit(1);

        if (remainingImages && remainingImages.length > 0) {
          await supabase
            .from('project_images')
            .update({ is_primary: true })
            .eq('id', remainingImages[0].id);
        }
      }

      // Log the deletion
      await AuditLogger.logFileDelete(image.image_path, image.image_path);

      return {
        success: true,
        message: 'Image deleted successfully'
      };
    } catch (error) {
      console.error('Delete project image error:', error);
      return {
        success: false,
        message: 'An error occurred while deleting image'
      };
    }
  }

  /**
   * Set an image as primary thumbnail
   */
  static async setPrimaryImage(imageId: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Get image details
      const { data: image, error: fetchError } = await supabase
        .from('project_images')
        .select('project_id, is_primary')
        .eq('id', imageId)
        .maybeSingle();

      if (fetchError || !image) {
        return {
          success: false,
          message: 'Image not found'
        };
      }

      if (image.is_primary) {
        return {
          success: true,
          message: 'Image is already set as primary'
        };
      }

      // Unset current primary
      await supabase
        .from('project_images')
        .update({ is_primary: false })
        .eq('project_id', image.project_id)
        .eq('is_primary', true);

      // Set new primary
      const { error: updateError } = await supabase
        .from('project_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      if (updateError) {
        console.error('Update primary error:', updateError);
        return {
          success: false,
          message: 'Failed to set primary image'
        };
      }

      return {
        success: true,
        message: 'Primary image updated successfully'
      };
    } catch (error) {
      console.error('Set primary image error:', error);
      return {
        success: false,
        message: 'An error occurred while setting primary image'
      };
    }
  }

  /**
   * Delete all images for a project (used when deleting a project)
   */
  static async deleteAllProjectImages(projectId: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Get all images for the project
      const { data: images, error: fetchError } = await supabase
        .from('project_images')
        .select('id, image_path')
        .eq('project_id', projectId);

      if (fetchError) {
        console.error('Fetch images error:', fetchError);
        return {
          success: false,
          message: 'Failed to fetch project images'
        };
      }

      if (!images || images.length === 0) {
        return {
          success: true,
          message: 'No images to delete'
        };
      }

      // Delete all images
      const deletionResults = await Promise.all(
        images.map(image => this.deleteProjectImage(image.id))
      );

      const failedDeletions = deletionResults.filter(r => !r.success);

      if (failedDeletions.length > 0) {
        return {
          success: false,
          message: `Failed to delete ${failedDeletions.length} image(s)`
        };
      }

      return {
        success: true,
        message: `Successfully deleted ${images.length} image(s)`
      };
    } catch (error) {
      console.error('Delete all project images error:', error);
      return {
        success: false,
        message: 'An error occurred while deleting images'
      };
    }
  }

  /**
   * Get primary/thumbnail image for a project
   */
  static async getPrimaryImage(projectId: string): Promise<ProjectImageUploadResult> {
    try {
      const { data, error } = await supabase
        .from('project_images')
        .select('id, image_url, image_path')
        .eq('project_id', projectId)
        .eq('is_primary', true)
        .maybeSingle();

      if (error) {
        console.error('Get primary image error:', error);
        return {
          success: false,
          message: 'Failed to fetch primary image'
        };
      }

      if (!data) {
        // If no primary image, get the first image
        const { data: firstImage } = await supabase
          .from('project_images')
          .select('id, image_url, image_path')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (firstImage) {
          return {
            success: true,
            data: {
              id: firstImage.id,
              url: firstImage.image_url,
              path: firstImage.image_path
            }
          };
        }

        return {
          success: false,
          message: 'No images found for this project'
        };
      }

      return {
        success: true,
        data: {
          id: data.id,
          url: data.image_url,
          path: data.image_path
        }
      };
    } catch (error) {
      console.error('Get primary image error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching primary image'
      };
    }
  }
}
