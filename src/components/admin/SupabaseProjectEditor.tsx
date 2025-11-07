import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Upload, Github, ExternalLink, Star, Image as ImageIcon, Users, Video, Trash2, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ImageUpload } from '../ui/ImageUpload';
import { VideoUpload } from '../ui/VideoUpload';
import { ProjectImagesManager } from './ProjectImagesManager';
import { ProjectsService } from '../../services/projects';
import { AuditLogger } from '../../services/auditLogger';
import { DevelopersService } from '../../services/developers';
import { useToast, ToastContainer } from '../ui/Toast';
import type { ProjectMedia } from '../../services/projects';
import type { ProjectWithDetails, Developer } from '../../lib/supabase';

interface SupabaseProjectEditorProps {
  project?: ProjectWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const SupabaseProjectEditor: React.FC<SupabaseProjectEditorProps> = ({
  project,
  isOpen,
  onClose,
  onSave
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: [] as string[],
    github_link: '',
    live_demo_link: '',
    thumbnail: '',
    featured: false,
    published: true,
    status: 'active' as 'active' | 'draft' | 'archived',
    display_order: 0,
    developer_ids: [] as string[]
  });

  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [newTech, setNewTech] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDevelopers, setIsLoadingDevelopers] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<ProjectMedia[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // Load developers on mount
  useEffect(() => {
    if (isOpen) {
      loadDevelopers();
    }
  }, [isOpen]);

  // Initialize form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        technologies: project.technologies || [],
        github_link: project.github_link || '',
        live_demo_link: project.live_demo_link || '',
        thumbnail: project.thumbnail || '',
        featured: project.featured || false,
        published: project.published !== false,
        status: project.status || 'active',
        display_order: project.display_order || 0,
        developer_ids: project.project_developers?.map(pd => pd.developer_id) || []
      });
    } else {
      // Reset form for new project
      setFormData({
        title: '',
        description: '',
        technologies: [],
        github_link: '',
        live_demo_link: '',
        thumbnail: '',
        featured: false,
        published: true,
        status: 'active',
        display_order: 0,
        developer_ids: []
      });
    }
  }, [project]);

  const loadDevelopers = async () => {
    setIsLoadingDevelopers(true);
    try {
      const result = await DevelopersService.getAllDevelopers();
      if (result.success) {
        setDevelopers(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load developers:', error);
    } finally {
      setIsLoadingDevelopers(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTechnology = () => {
    if (newTech.trim() && !formData.technologies.includes(newTech.trim())) {
      handleInputChange('technologies', [...formData.technologies, newTech.trim()]);
      setNewTech('');
    }
  };

  const removeTechnology = (tech: string) => {
    handleInputChange('technologies', formData.technologies.filter(t => t !== tech));
  };

  const toggleDeveloper = (developerId: string) => {
    const currentIds = formData.developer_ids;
    if (currentIds.includes(developerId)) {
      handleInputChange('developer_ids', currentIds.filter(id => id !== developerId));
    } else {
      handleInputChange('developer_ids', [...currentIds, developerId]);
    }
  };

  const handleImageUpdate = async (imageUrl: string) => {
    setFormData(prev => ({ ...prev, thumbnail: imageUrl }));
  };

  const handleMediaUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newMediaFiles: ProjectMedia[] = Array.from(files).map(file => ({
      file,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      isPrimary: false
    }));
    
    setMediaFiles(prev => [...prev, ...newMediaFiles]);
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const setAsPrimaryMedia = (index: number) => {
    setMediaFiles(prev => prev.map((media, i) => ({
      ...media,
      isPrimary: i === index
    })));
  };

  const previewProject = () => {
    if (project && project.published) {
      window.open(`/#projects`, '_blank');
    } else {
      alert('Project must be published to preview');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title.trim() || !formData.description.trim()) {
        toast.error('Validation Error', 'Please fill in all required fields (Title and Description)');
        return;
      }

      if (project) {
        // Update existing project
        console.log('Updating project:', project.id, formData);
        const result = await ProjectsService.updateProject(project.id, formData, mediaFiles);
        console.log('Update result:', result);
        if (result.success) {
          toast.success('Success', 'Project updated successfully');
          onSave();
          onClose();
        } else {
          console.error('Failed to update project:', result.message);
          toast.error('Update Failed', result.message || 'Failed to update project');
        }
      } else {
        // Create new project
        console.log('Creating project:', formData);
        const result = await ProjectsService.createProject(formData, mediaFiles);
        console.log('Create result:', result);
        if (result.success) {
          toast.success('Success', 'Project created successfully');
          onSave();
          onClose();
        } else {
          console.error('Failed to create project:', result.message);
          toast.error('Creation Failed', result.message || 'Failed to create project');
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Error', 'An error occurred while saving the project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const predefinedImages = [
    'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=800'
  ];

  const commonTechnologies = [
    'React', 'TypeScript', 'Node.js', 'MongoDB', 'PostgreSQL', 'TailwindCSS', 
    'Next.js', 'Express.js', 'JavaScript', 'HTML', 'CSS', 'Supabase', 'Firebase', 'MySQL',
    'Git/GitHub', 'REST APIs', 'GraphQL', 'Socket.io', 'JWT', 'Stripe API'
  ];

  return (
    <>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={project ? 'Update Project' : 'Create Project'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Thumbnail */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <ImageIcon className="w-5 h-5 mr-2" />
            Project Thumbnail
          </h3>
          
          <div className="flex flex-col space-y-4">
            {/* Current Image Preview */}
            <div className="relative">
              <img
                src={formData.thumbnail || predefinedImages[0]}
                alt="Project preview"
                className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
              />
            </div>

            {/* Image Upload */}
            <div className="flex justify-center">
              <div className="text-center">
                <ImageUpload
                  currentImage={formData.thumbnail}
                  onImageUpdate={handleImageUpdate}
                  uploadType="project"
                  cropShape="rect"
                  aspectRatio={16/9}
                  className="w-32 h-20"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Upload custom thumbnail</p>
              </div>
            </div>

            {/* Predefined Images */}
            {!formData.thumbnail?.includes('supabase') && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Or choose from predefined images:</p>
                <div className="grid grid-cols-3 gap-3">
                  {predefinedImages.map((img, index) => (
                    <motion.img
                      key={index}
                      src={img}
                      alt={`Option ${index + 1}`}
                      className={`w-full h-20 object-cover rounded-lg cursor-pointer border-2 transition-all duration-300 ${
                        formData.thumbnail === img
                          ? 'border-blue-500 ring-2 ring-blue-500/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleInputChange('thumbnail', img)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Video className="w-5 h-5 mr-2" />
            Project Media
          </h3>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Upload images and videos for your project
              </p>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleMediaUpload(e.target.files)}
                className="hidden"
                id="media-upload"
              />
              <label
                htmlFor="media-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </label>
            </div>
          </div>
          
          {/* Media Files List */}
          {mediaFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Selected Files ({mediaFiles.length})
              </p>
              <div className="grid grid-cols-2 gap-3">
                {mediaFiles.map((media, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      {media.type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-8 h-8 text-gray-400" />
                          <span className="ml-2 text-sm text-gray-600">{media.file.name}</span>
                        </div>
                      ) : (
                        <img
                          src={URL.createObjectURL(media.file)}
                          alt="Selected file"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <button
                        type="button"
                        onClick={() => setAsPrimaryMedia(index)}
                        className={`p-1 rounded text-xs ${
                          media.isPrimary 
                            ? 'bg-green-600 text-white' 
                            : 'bg-black/50 text-white hover:bg-black/70'
                        }`}
                      >
                        {media.isPrimary ? '★' : '☆'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          removeMediaFile(index);
                        }}
                        className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Project Images Manager - Only show for existing projects */}
        {project && project.id && project.id !== 'new' && (
          <div className="space-y-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <ProjectImagesManager
              projectId={project.id}
              onImagesChange={() => {}}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Project Details
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter project title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Describe your project..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  Featured Project
                </span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => handleInputChange('published', e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Published (visible on live site)
                </span>
              </label>
            </div>
          </div>

          {/* Links and Team */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Links & Team
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Github className="w-4 h-4 inline mr-1" />
                GitHub Repository
              </label>
              <input
                type="url"
                value={formData.github_link}
                onChange={(e) => handleInputChange('github_link', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="https://github.com/username/repo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <ExternalLink className="w-4 h-4 inline mr-1" />
                Live Demo URL (Optional)
              </label>
              <input
                type="url"
                value={formData.live_demo_link}
                onChange={(e) => handleInputChange('live_demo_link', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="https://your-demo-site.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Users className="w-4 h-4 inline mr-1" />
                Assign Developers
              </label>
              {isLoadingDevelopers ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {developers.map((developer) => (
                    <label key={developer.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.developer_ids.includes(developer.id)}
                        onChange={() => toggleDeveloper(developer.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {developer.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Technologies */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Technologies Used
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.technologies.map((tech) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium group"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => removeTechnology(tech)}
                  className="ml-2 text-blue-600 hover:text-red-600 dark:text-blue-400 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Add technology (e.g., React, Node.js)"
            />
            <Button
              type="button"
              onClick={addTechnology}
              variant="outline"
            >
              Add
            </Button>
          </div>

          {/* Quick add common technologies */}
          <div className="flex flex-wrap gap-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 w-full mb-2">Quick add:</p>
            {commonTechnologies.map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => {
                  if (!formData.technologies.includes(tech)) {
                    handleInputChange('technologies', [...formData.technologies, tech]);
                  }
                }}
                disabled={formData.technologies.includes(tech)}
                className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          {project?.id !== 'new' && (
            <Button
              type="button"
              variant="outline"
              onClick={previewProject}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
            </Button>
          </motion.div>
        </div>
      </form>
    </Modal>
    </>
  );
};