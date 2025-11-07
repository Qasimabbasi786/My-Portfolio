import { supabase } from '../lib/supabase';
import { StorageService } from './storage';
import { AuditLogger } from './auditLogger';
import type { Project, ProjectWithDetails, ProjectImage, ProjectDeveloper } from '../lib/supabase';

export interface CreateProjectData {
  title: string;
  description?: string;
  technologies?: string[];
  github_link?: string;
  live_demo_link?: string;
  thumbnail?: string;
  featured?: boolean;
  published?: boolean;
  status?: 'active' | 'archived' | 'draft';
  developer_ids?: string[];
  display_order?: number;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}

export interface ProjectMedia {
  file: File;
  type: 'image' | 'video';
  isPrimary?: boolean;
}

export class ProjectsService {
  // Get all projects with details (admin view)
  static async getAllProjects(includeDetails = false): Promise<{ success: boolean; data?: ProjectWithDetails[]; message?: string }> {
    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (includeDetails) {
        query = supabase
          .from('projects')
          .select(`
            *,
            project_images (*),
            project_developers (
              *,
              developer:developers (*)
            )
          `)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Get projects error:', error);
        return {
          success: false,
          message: 'Failed to fetch projects'
        };
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Get projects error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching projects'
      };
    }
  }

  // Get published projects (public view)
  static async getPublishedProjects(): Promise<{ success: boolean; data?: ProjectWithDetails[]; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_images (*),
          project_developers (
            *,
            developer:developers (*)
          )
        `)
        .eq('published', true)
        .eq('status', 'active')
        .order('display_order', { ascending: true })
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get published projects error:', error);
        return {
          success: false,
          message: 'Failed to fetch projects'
        };
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Get published projects error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching projects'
      };
    }
  }

  // Get project by ID
  static async getProjectById(id: string): Promise<{ success: boolean; data?: ProjectWithDetails; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_images (*),
          project_developers (
            *,
            developer:developers (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Get project error:', error);
        return {
          success: false,
          message: 'Project not found'
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Get project error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching project'
      };
    }
  }

  // Create new project with real-time updates
  static async createProject(projectData: CreateProjectData, mediaFiles?: ProjectMedia[]): Promise<{ success: boolean; data?: Project; message?: string }> {
    try {
      // Validate required fields
      if (!projectData.title?.trim()) {
        return {
          success: false,
          message: 'Project title is required'
        };
      }

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: projectData.title.trim(),
          description: projectData.description?.trim(),
          technologies: projectData.technologies || [],
          github_link: projectData.github_link?.trim(),
          live_demo_link: projectData.live_demo_link?.trim(),
          thumbnail: projectData.thumbnail,
          featured: projectData.featured || false,
          published: projectData.published !== false, // Default to true
          status: projectData.status || 'active',
          display_order: projectData.display_order || 0
        })
        .select()
        .single();

      if (projectError) {
        console.error('Create project error:', projectError);
        return {
          success: false,
          message: 'Failed to create project'
        };
      }

      // If thumbnail is a supabase URL, add it to project_images
      if (projectData.thumbnail && projectData.thumbnail.includes('supabase')) {
        const pathMatch = projectData.thumbnail.match(/project_images\/(.+)$/);
        const imagePath = pathMatch ? pathMatch[1] : `project-${project.id}-thumbnail.jpg`;

        await supabase
          .from('project_images')
          .insert({
            project_id: project.id,
            image_url: projectData.thumbnail,
            image_path: imagePath,
            is_primary: true,
            type: 'image'
          });
      }

      // Add developer associations if provided
      if (projectData.developer_ids && projectData.developer_ids.length > 0) {
        const developerAssociations = projectData.developer_ids.map(developerId => ({
          project_id: project.id,
          developer_id: developerId,
          role: 'developer'
        }));

        const { error: associationError } = await supabase
          .from('project_developers')
          .insert(developerAssociations);

        if (associationError) {
          console.error('Failed to create developer associations:', associationError);
        }
      }

      // Upload media files if provided
      if (mediaFiles && mediaFiles.length > 0) {
        await this.uploadProjectMedia(project.id, mediaFiles);
      }

      // Log the creation
      await AuditLogger.logCreate('projects', project.id, projectData);

      return {
        success: true,
        data: project,
        message: 'Project created successfully'
      };
    } catch (error) {
      console.error('Create project error:', error);
      return {
        success: false,
        message: 'An error occurred while creating project'
      };
    }
  }

  // Update project with real-time updates
  static async updateProject(id: string, updateData: UpdateProjectData, mediaFiles?: ProjectMedia[]): Promise<{ success: boolean; data?: Project; message?: string }> {
    try {
      // Get existing project for audit log
      const { data: existingProject } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (!existingProject) {
        return {
          success: false,
          message: 'Project not found'
        };
      }

      // Prepare update data
      const cleanUpdateData: any = {};
      if (updateData.title !== undefined) cleanUpdateData.title = updateData.title.trim();
      if (updateData.description !== undefined) cleanUpdateData.description = updateData.description?.trim();
      if (updateData.technologies !== undefined) cleanUpdateData.technologies = updateData.technologies;
      if (updateData.github_link !== undefined) cleanUpdateData.github_link = updateData.github_link?.trim();
      if (updateData.live_demo_link !== undefined) cleanUpdateData.live_demo_link = updateData.live_demo_link?.trim();
      if (updateData.thumbnail !== undefined) cleanUpdateData.thumbnail = updateData.thumbnail;
      if (updateData.featured !== undefined) cleanUpdateData.featured = updateData.featured;
      if (updateData.published !== undefined) cleanUpdateData.published = updateData.published;
      if (updateData.status !== undefined) cleanUpdateData.status = updateData.status;
      if (updateData.display_order !== undefined) cleanUpdateData.display_order = updateData.display_order;

      const { data, error } = await supabase
        .from('projects')
        .update(cleanUpdateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update project error:', error);
        return {
          success: false,
          message: 'Failed to update project'
        };
      }

      // If thumbnail was updated and contains supabase storage URL, add it to project_images if not already there
      if (updateData.thumbnail && updateData.thumbnail.includes('supabase')) {
        const { data: existingImage } = await supabase
          .from('project_images')
          .select('id')
          .eq('project_id', id)
          .eq('image_url', updateData.thumbnail)
          .maybeSingle();

        if (!existingImage) {
          const pathMatch = updateData.thumbnail.match(/project_images\/(.+)$/);
          const imagePath = pathMatch ? pathMatch[1] : `project-${id}-thumbnail.jpg`;

          await supabase
            .from('project_images')
            .update({ is_primary: false })
            .eq('project_id', id)
            .eq('is_primary', true);

          await supabase
            .from('project_images')
            .insert({
              project_id: id,
              image_url: updateData.thumbnail,
              image_path: imagePath,
              is_primary: true,
              type: 'image'
            });
        }
      }

      // Update developer associations if provided
      if (updateData.developer_ids !== undefined) {
        // Remove existing associations
        await supabase
          .from('project_developers')
          .delete()
          .eq('project_id', id);

        // Add new associations
        if (updateData.developer_ids.length > 0) {
          const developerAssociations = updateData.developer_ids.map(developerId => ({
            project_id: id,
            developer_id: developerId,
            role: 'developer'
          }));

          await supabase
            .from('project_developers')
            .insert(developerAssociations);
        }
      }

      // Upload new media files if provided
      if (mediaFiles && mediaFiles.length > 0) {
        await this.uploadProjectMedia(id, mediaFiles);
      }

      // Log the update
      await AuditLogger.logUpdate('projects', id, existingProject, cleanUpdateData);

      return {
        success: true,
        data,
        message: 'Project updated successfully'
      };
    } catch (error) {
      console.error('Update project error:', error);
      return {
        success: false,
        message: 'An error occurred while updating project'
      };
    }
  }

  // Toggle project publish status with real-time updates
  static async togglePublishStatus(id: string): Promise<{ success: boolean; data?: Project; message?: string }> {
    try {
      // Get current status
      const { data: currentProject } = await supabase
        .from('projects')
        .select('published')
        .eq('id', id)
        .single();

      if (!currentProject) {
        return {
          success: false,
          message: 'Project not found'
        };
      }

      // Toggle the status
      const newStatus = !currentProject.published;

      const { data, error } = await supabase
        .from('projects')
        .update({ published: newStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Toggle publish error:', error);
        return {
          success: false,
          message: 'Failed to toggle publish status'
        };
      }

      // Log the change
      await AuditLogger.logUpdate('projects', id, { published: currentProject.published }, { published: newStatus });

      return {
        success: true,
        data,
        message: `Project ${newStatus ? 'published' : 'unpublished'} successfully`
      };
    } catch (error) {
      console.error('Toggle publish error:', error);
      return {
        success: false,
        message: 'An error occurred while toggling publish status'
      };
    }
  }

  // Delete project with cleanup
  static async deleteProject(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Get project details for cleanup and audit
      const { data: existingProject } = await supabase
        .from('projects')
        .select(`
          *,
          project_images (image_path)
        `)
        .eq('id', id)
        .single();

      if (!existingProject) {
        return {
          success: false,
          message: 'Project not found'
        };
      }

      // Delete associated images from storage
      if (existingProject.thumbnail) {
        const pathMatch = existingProject.thumbnail.match(/project_images\/(.+)$/);
        if (pathMatch) {
          await StorageService.deleteFile('project_images', pathMatch[1]);
        }
      }

      // Delete project images from storage
      if (existingProject.project_images) {
        for (const image of existingProject.project_images) {
          if (image.image_path) {
            await StorageService.deleteFile('project_images', image.image_path);
          }
        }
      }

      // Delete project (cascading deletes will handle related records)
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete project error:', error);
        return {
          success: false,
          message: 'Failed to delete project'
        };
      }

      // Log the deletion
      await AuditLogger.logDelete('projects', id, existingProject);

      return {
        success: true,
        message: 'Project deleted successfully'
      };
    } catch (error) {
      console.error('Delete project error:', error);
      return {
        success: false,
        message: 'An error occurred while deleting project'
      };
    }
  }

  // Upload multiple media files for a project
  static async uploadProjectMedia(projectId: string, mediaFiles: ProjectMedia[]): Promise<{ success: boolean; message?: string }> {
    try {
      const uploadPromises = mediaFiles.map(async (media, index) => {
        if (media.type === 'image') {
          const uploadResult = await StorageService.uploadProjectImage(media.file, projectId);
          if (uploadResult.success) {
            return supabase
              .from('project_images')
              .insert({
                project_id: projectId,
                image_path: uploadResult.path,
                image_url: uploadResult.url,
                type: 'image',
                is_primary: media.isPrimary || index === 0
              });
          }
        } else if (media.type === 'video') {
          const uploadResult = await StorageService.uploadProjectVideo(media.file, projectId);
          if (uploadResult.success) {
            return supabase
              .from('project_images')
              .insert({
                project_id: projectId,
                image_path: uploadResult.path,
                image_url: uploadResult.url,
                type: 'video',
                is_primary: false
              });
          }
        }
      });

      await Promise.all(uploadPromises);

      return {
        success: true,
        message: 'Media files uploaded successfully'
      };
    } catch (error) {
      console.error('Upload media error:', error);
      return {
        success: false,
        message: 'Failed to upload media files'
      };
    }
  }

  // Delete project media
  static async deleteProjectMedia(imageId: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Get image details
      const { data: image, error: fetchError } = await supabase
        .from('project_images')
        .select('image_path')
        .eq('id', imageId)
        .single();

      if (fetchError || !image) {
        return {
          success: false,
          message: 'Media not found'
        };
      }

      // Delete from storage
      if (image.image_path) {
        await StorageService.deleteFile('project_images', image.image_path);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('project_images')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        console.error('Delete media error:', dbError);
        return {
          success: false,
          message: 'Failed to delete media'
        };
      }

      return {
        success: true,
        message: 'Media deleted successfully'
      };
    } catch (error) {
      console.error('Delete media error:', error);
      return {
        success: false,
        message: 'An error occurred while deleting media'
      };
    }
  }

  // Update project order
  static async updateProjectOrder(projectId: string, newOrder: number): Promise<{ success: boolean; message?: string }> {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ display_order: newOrder })
        .eq('id', projectId);

      if (error) {
        console.error('Update order error:', error);
        return {
          success: false,
          message: 'Failed to update project order'
        };
      }

      return {
        success: true,
        message: 'Project order updated successfully'
      };
    } catch (error) {
      console.error('Update order error:', error);
      return {
        success: false,
        message: 'An error occurred while updating project order'
      };
    }
  }

  // Bulk update project orders
  static async updateProjectsOrder(orders: { id: string; display_order: number }[]): Promise<{ success: boolean; message?: string }> {
    try {
      // Update each project's order individually
      const updates = orders.map(({ id, display_order }) =>
        supabase
          .from('projects')
          .update({ display_order })
          .eq('id', id)
      );

      const results = await Promise.all(updates);
      
      const failed = results.filter(result => result.error);
      if (failed.length > 0) {
        console.error('Update projects order - Failed updates:', failed.length);
        failed.forEach((result, index) => {
          console.error(`Project order update error #${index + 1}:`, {
            error: result.error,
            code: result.error?.code,
            message: result.error?.message,
            details: result.error?.details,
            hint: result.error?.hint
          });
        });
        return {
          success: false,
          message: `Failed to update ${failed.length} project order(s). Check console for details.`
        };
      }

      return {
        success: true,
        message: 'Project orders updated successfully'
      };
    } catch (error) {
      console.error('Update projects order error:', error);
      return {
        success: false,
        message: 'An error occurred while updating project orders'
      };
    }
  }

  // Get projects by developer
  static async getProjectsByDeveloper(developerId: string): Promise<{ success: boolean; data?: ProjectWithDetails[]; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('project_developers')
        .select(`
          project:projects (
            *,
            project_images (*),
            project_developers (
              *,
              developer:developers (*)
            )
          )
        `)
        .eq('developer_id', developerId);

      if (error) {
        console.error('Get developer projects error:', error);
        return {
          success: false,
          message: 'Failed to fetch projects'
        };
      }

      const projects = data?.map(item => item.project).filter(Boolean) as ProjectWithDetails[];

      return {
        success: true,
        data: projects || []
      };
    } catch (error) {
      console.error('Get developer projects error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching projects'
      };
    }
  }
}