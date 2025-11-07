import { supabase } from '../lib/supabase';
import { StorageService } from './storage';
import type { Developer } from '../lib/supabase';

export interface CreateDeveloperData {
  name: string;
  email: string;
  password: string;
  github_link?: string;
  linkedin?: string;
  title?: string;
  skills?: string[];
  profile_picture?: string;
  bio?: string;
}

export interface UpdateDeveloperData extends Partial<Omit<CreateDeveloperData, 'password'>> {
  password?: string;
}

export class DevelopersService {
  // Get all developers
  static async getAllDevelopers(): Promise<{ success: boolean; data?: Developer[]; message?: string }> {
    try {
      // Try ordering by display_order first, fallback to created_at if column doesn't exist
      let query = supabase.from('developers').select('*');
      
      const { data, error } = await query
        .order('created_at', { ascending: true });

      if (error) {
        return {
          success: false,
          message: 'Failed to fetch developers'
        };
      }

      // Sort by display_order client-side if the field exists
      const sortedData = data ? [...data].sort((a, b) => {
        const orderA = (a as any).display_order ?? 999999;
        const orderB = (b as any).display_order ?? 999999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }) : [];

      return {
        success: true,
        data: sortedData
      };
    } catch (error) {
      console.error('Get developers error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching developers'
      };
    }
  }

  // Get developer by ID
  static async getDeveloperById(id: string): Promise<{ success: boolean; data?: Developer; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return {
          success: false,
          message: 'Developer not found'
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Get developer error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching developer'
      };
    }
  }

  // Create new developer
  static async createDeveloper(developerData: CreateDeveloperData): Promise<{ success: boolean; data?: Developer; message?: string }> {
    try {
      // Validate required fields
      if (!developerData.name) {
        return {
          success: false,
          message: 'Developer name is required'
        };
      }

      if (!developerData.email) {
        return {
          success: false,
          message: 'Email is required'
        };
      }

      if (!developerData.password) {
        return {
          success: false,
          message: 'Password is required'
        };
      }

      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        return {
          success: false,
          message: 'Admin authentication required'
        };
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-developer-management?action=create`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify({
          name: developerData.name.trim(),
          email: developerData.email.toLowerCase().trim(),
          password: developerData.password,
          github_link: developerData.github_link?.trim(),
          linkedin: developerData.linkedin?.trim(),
          title: developerData.title?.trim(),
          skills: developerData.skills || [],
          profile_picture: developerData.profile_picture?.trim(),
          bio: developerData.bio?.trim(),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Failed to create developer'
        };
      }

      const data = result.data;

      // If a profile picture was uploaded to avatars bucket, migrate it to developer_profiles
      if (data && developerData.profile_picture && developerData.profile_picture.includes('avatars')) {
        try {
          // The URL format is: https://{supabase_url}/storage/v1/object/public/avatars/avatars/{filename}
          // Extract the filename from the URL
          const urlParts = developerData.profile_picture.split('/');
          const filename = urlParts[urlParts.length - 1];

          // Download from avatars bucket
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('avatars')
            .download(`avatars/${filename}`);

          if (!downloadError && fileData) {
            // Upload to developer_profiles bucket
            const newFilename = `developer-${data.id}.${filename.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage
              .from('developer_profiles')
              .upload(newFilename, fileData, {
                cacheControl: '3600',
                upsert: true
              });

            if (!uploadError) {
              // Get new public URL
              const { data: { publicUrl } } = supabase.storage
                .from('developer_profiles')
                .getPublicUrl(newFilename);

              // Update developer record with new URL
              await supabase
                .from('developers')
                .update({ profile_picture: publicUrl })
                .eq('id', data.id);

              // Delete old file from avatars bucket
              await supabase.storage
                .from('avatars')
                .remove([`avatars/${filename}`]);

              data.profile_picture = publicUrl;
            }
          }
        } catch (migrationError) {
          console.error('Profile picture migration error:', migrationError);
          // Continue even if migration fails - the developer was created successfully
        }
      }

      return {
        success: true,
        data,
        message: 'Developer created successfully'
      };
    } catch (error) {
      console.error('Create developer error:', error);
      return {
        success: false,
        message: 'An error occurred while creating developer'
      };
    }
  }

  // Update developer
  static async updateDeveloper(id: string, updateData: UpdateDeveloperData): Promise<{ success: boolean; data?: Developer; message?: string }> {
    try {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        return {
          success: false,
          message: 'Admin authentication required'
        };
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-developer-management?action=update`;

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify({
          id,
          ...updateData,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Failed to update developer'
        };
      }

      const data = result.data;

      return {
        success: true,
        data,
        message: 'Developer updated successfully'
      };
    } catch (error) {
      console.error('Update developer error:', error);
      return {
        success: false,
        message: 'An error occurred while updating developer'
      };
    }
  }

  // Delete developer
  static async deleteDeveloper(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Check if developer is associated with any projects
      const { data: projectAssociations } = await supabase
        .from('project_developers')
        .select('id')
        .eq('developer_id', id)
        .limit(1);

      if (projectAssociations && projectAssociations.length > 0) {
        return {
          success: false,
          message: 'Cannot delete developer who is associated with projects. Remove project associations first.'
        };
      }

      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        return {
          success: false,
          message: 'Admin authentication required'
        };
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-developer-management?action=delete`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Failed to delete developer'
        };
      }

      return {
        success: true,
        message: 'Developer deleted successfully'
      };
    } catch (error) {
      console.error('Delete developer error:', error);
      return {
        success: false,
        message: 'An error occurred while deleting developer'
      };
    }
  }

  // Upload profile picture
  static async uploadProfilePicture(file: File, developerId: string): Promise<{ success: boolean; url?: string; message?: string }> {
    try {
      // Upload to storage
      const uploadResult = await StorageService.uploadAvatar(file, `developer-${developerId}`);
      
      if (!uploadResult.success) {
        return uploadResult;
      }

      // Update developer record with new profile picture URL
      const { error } = await supabase
        .from('developers')
        .update({ profile_picture: uploadResult.url })
        .eq('id', developerId);

      if (error) {
        return {
          success: false,
          message: 'Failed to update developer profile picture'
        };
      }

      return {
        success: true,
        url: uploadResult.url,
        message: 'Profile picture uploaded successfully'
      };
    } catch (error) {
      console.error('Upload profile picture error:', error);
      return {
        success: false,
        message: 'An error occurred while uploading profile picture'
      };
    }
  }

  // Helper function to hash password
  private static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Helper function to verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const hash = await this.hashPassword(password);
    return hash === hashedPassword;
  }

  // Authenticate developer
  static async authenticateDeveloper(email: string, password: string): Promise<{ success: boolean; data?: Developer; message?: string }> {
    try {
      if (!email || !password) {
        return {
          success: false,
          message: 'Email and password are required'
        };
      }

      const { data: developer, error } = await supabase
        .from('developers')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (error || !developer) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Direct password comparison for compatibility with stored passwords
      const isValidPassword = password === developer.password;

      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      return {
        success: true,
        data: developer,
        message: 'Authentication successful'
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        message: 'An error occurred during authentication'
      };
    }
  }

  // Update developer display order
  static async updateDeveloperOrder(developerId: string, newOrder: number): Promise<{ success: boolean; message?: string }> {
    try {
      const { error } = await supabase
        .from('developers')
        .update({ display_order: newOrder })
        .eq('id', developerId);

      if (error) {
        console.error('Update developer order error:', error);
        return {
          success: false,
          message: 'Failed to update developer order'
        };
      }

      return {
        success: true,
        message: 'Developer order updated successfully'
      };
    } catch (error) {
      console.error('Update developer order error:', error);
      return {
        success: false,
        message: 'An error occurred while updating developer order'
      };
    }
  }

  // Bulk update developer orders
  static async updateDevelopersOrder(orders: { id: string; display_order: number }[]): Promise<{ success: boolean; message?: string }> {
    try {
      // Update each developer's order individually
      const updates = orders.map(({ id, display_order }) =>
        supabase
          .from('developers')
          .update({ display_order })
          .eq('id', id)
      );

      const results = await Promise.all(updates);
      
      const failed = results.filter(result => result.error);
      if (failed.length > 0) {
        console.error('Update developers order - Failed updates:', failed.length);
        failed.forEach((result, index) => {
          console.error(`Developer order update error #${index + 1}:`, {
            error: result.error,
            code: result.error?.code,
            message: result.error?.message,
            details: result.error?.details,
            hint: result.error?.hint
          });
        });
        return {
          success: false,
          message: `Failed to update ${failed.length} developer order(s). Check console for details.`
        };
      }

      return {
        success: true,
        message: 'Developer orders updated successfully'
      };
    } catch (error) {
      console.error('Update developers order error:', error);
      return {
        success: false,
        message: 'An error occurred while updating developer orders'
      };
    }
  }
}