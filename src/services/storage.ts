import { supabase } from '../lib/supabase';
import { AuditLogger } from './auditLogger';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  message?: string;
}

export class StorageService {
  // Validate file type and size for profile pictures
  static validateProfilePicture(file: File): { valid: boolean; message?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message: 'Invalid file type. Only JPG, PNG, and WebP files are allowed.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        message: 'File size exceeds 5MB limit.'
      };
    }

    return { valid: true };
  }

  // Upload developer profile picture to developer_profiles bucket
  static async uploadDeveloperProfilePicture(
    file: File,
    developerId: string,
    currentProfilePictureUrl?: string
  ): Promise<UploadResult> {
    try {
      const validation = this.validateProfilePicture(file);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message
        };
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `developer-${developerId}.${fileExt}`;
      const filePath = fileName;

      if (currentProfilePictureUrl) {
        const urlParts = currentProfilePictureUrl.split('/');
        const oldFileName = urlParts[urlParts.length - 1];

        if (oldFileName && oldFileName.startsWith('developer-')) {
          await supabase.storage
            .from('developer_profiles')
            .remove([oldFileName]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('developer_profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        return {
          success: false,
          message: `Upload failed: ${uploadError.message}`
        };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('developer_profiles')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('developers')
        .update({
          profile_picture: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', developerId);

      if (updateError) {
        return {
          success: false,
          message: `Failed to update developer profile: ${updateError.message}`
        };
      }

      await AuditLogger.logFileUpload(file.name, filePath, file.size);

      return {
        success: true,
        url: publicUrl,
        path: filePath,
        message: 'Profile picture uploaded successfully'
      };
    } catch (error) {
      console.error('Developer profile picture upload error:', error);
      return {
        success: false,
        message: 'An error occurred during upload'
      };
    }
  }

  // Upload profile picture to avatars bucket
  static async uploadAvatar(file: File, fileName?: string): Promise<UploadResult> {
    try {
      const fileExt = file.name.split('.').pop();
      const finalFileName = fileName || `avatar-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${finalFileName}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        return {
          success: false,
          message: `Upload failed: ${error.message}`
        };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return {
        success: true,
        url: publicUrl,
        path: filePath,
        message: 'Avatar uploaded successfully'
      };
    } catch (error) {
      console.error('Avatar upload error:', error);
      return {
        success: false,
        message: 'An error occurred during upload'
      };
    }
  }

  // Upload project image to project_images bucket
  static async uploadProjectImage(file: File, projectId?: string): Promise<UploadResult> {
    try {
      const validation = this.validateProjectImage(file);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message
        };
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `project-${projectId || Date.now()}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('project_images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        return {
          success: false,
          message: `Upload failed: ${error.message}`
        };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('project_images')
        .getPublicUrl(fileName);

      return {
        success: true,
        url: publicUrl,
        path: fileName,
        message: 'Project image uploaded successfully'
      };
    } catch (error) {
      console.error('Project image upload error:', error);
      return {
        success: false,
        message: 'An error occurred during upload'
      };
    }
  }

  // Validate project image file type and size
  static validateProjectImage(file: File): { valid: boolean; message?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message: 'Invalid file type. Only JPG, PNG, and WebP files are allowed.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        message: 'File size exceeds 5MB limit.'
      };
    }

    return { valid: true };
  }

  // Upload project video to projects bucket
  static async uploadProjectVideo(file: File, projectId?: string): Promise<UploadResult> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `video-${projectId || Date.now()}-${Date.now()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { data, error } = await supabase.storage
        .from('projects')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        return {
          success: false,
          message: `Upload failed: ${error.message}`
        };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('projects')
        .getPublicUrl(filePath);

      // Log file upload
      await AuditLogger.logFileUpload(file.name, filePath, file.size);

      return {
        success: true,
        url: publicUrl,
        path: filePath,
        message: 'Video uploaded successfully'
      };
    } catch (error) {
      console.error('Video upload error:', error);
      return {
        success: false,
        message: 'An error occurred during upload'
      };
    }
  }

  // List files in a bucket
  static async listFiles(bucket: string, folder?: string): Promise<{ success: boolean; files?: any[]; message?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
          limit: 100,
          offset: 0
        });

      if (error) {
        return {
          success: false,
          message: `Failed to list files: ${error.message}`
        };
      }

      // Transform data to include full URLs and metadata
      const files = data?.map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(folder ? `${folder}/${file.name}` : file.name);

        return {
          name: file.name,
          path: folder ? `${folder}/${file.name}` : file.name,
          size: file.metadata?.size || 0,
          type: this.getFileType(file.name),
          url: publicUrl,
          lastModified: new Date(file.updated_at || file.created_at)
        };
      }) || [];

      return {
        success: true,
        files
      };
    } catch (error) {
      console.error('List files error:', error);
      return {
        success: false,
        message: 'An error occurred while listing files'
      };
    }
  }

  // Helper method to determine file type
  private static getFileType(fileName: string): 'image' | 'video' | 'other' {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return 'image';
    }
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext || '')) {
      return 'video';
    }
    return 'other';
  }

  // Delete file from storage
  static async deleteFile(bucket: string, filePath: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        return {
          success: false,
          message: `Delete failed: ${error.message}`
        };
      }

      // Log file deletion
      await AuditLogger.logFileDelete(filePath.split('/').pop() || filePath, filePath);

      return {
        success: true,
        message: 'File deleted successfully'
      };
    } catch (error) {
      console.error('File delete error:', error);
      return {
        success: false,
        message: 'An error occurred during deletion'
      };
    }
  }

  // Get signed URL for private files (if needed)
  static async getSignedUrl(bucket: string, filePath: string, expiresIn = 3600): Promise<UploadResult> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        return {
          success: false,
          message: `Failed to get signed URL: ${error.message}`
        };
      }

      return {
        success: true,
        url: data.signedUrl,
        message: 'Signed URL generated successfully'
      };
    } catch (error) {
      console.error('Signed URL error:', error);
      return {
        success: false,
        message: 'An error occurred while generating signed URL'
      };
    }
  }
}