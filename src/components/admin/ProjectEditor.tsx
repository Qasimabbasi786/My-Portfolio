import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Upload, Github, ExternalLink, Star, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import type { Project } from '../../types';

interface ProjectEditorProps {
  project?: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id'>) => void;
}

export const ProjectEditor: React.FC<ProjectEditorProps> = ({
  project,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    name: project?.name || '',
    description: project?.description || '',
    technologies: project?.technologies || [],
    githubUrl: project?.githubUrl || '',
    liveUrl: project?.liveUrl || '',
    image: project?.image || 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=600',
    featured: project?.featured || false,
    developedBy: project?.developedBy || ['Muhammad Qasim', 'Azmat Mustafa']
  });

  const [newTech, setNewTech] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(formData.image);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        handleInputChange('image', result);
      };
      reader.readAsDataURL(file);
    }
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

  const toggleDeveloper = (developer: string) => {
    const currentDevelopers = formData.developedBy;
    if (currentDevelopers.includes(developer)) {
      handleInputChange('developedBy', currentDevelopers.filter(d => d !== developer));
    } else {
      handleInputChange('developedBy', [...currentDevelopers, developer]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.name.trim() || !formData.description.trim() || !formData.githubUrl.trim()) {
      alert('Please fill in all required fields (Name, Description, GitHub URL)');
      setIsSubmitting(false);
      return;
    }

    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSave(formData);
    setIsSubmitting(false);
  };

  const predefinedImages = [
    'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=600'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? 'Edit Project' : 'Add New Project'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Image */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <ImageIcon className="w-5 h-5 mr-2" />
            Project Thumbnail
          </h3>
          
          <div className="flex flex-col space-y-4">
            {/* Current Image Preview */}
            <div className="relative">
              <img
                src={imagePreview}
                alt="Project preview"
                className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-white hover:bg-white/20"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Change Image
                </Button>
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Use ImageUpload component instead
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const result = e.target?.result as string;
                        setImagePreview(result);
                        handleInputChange('image', result);
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Custom Image
              </Button>
            </div>

            {/* Predefined Images */}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Or choose from predefined images:</p>
              <div className="grid grid-cols-3 gap-3">
                {predefinedImages.map((img, index) => (
                  <motion.img
                    key={index}
                    src={img}
                    alt={`Option ${index + 1}`}
                    className={`w-full h-20 object-cover rounded-lg cursor-pointer border-2 transition-all duration-300 ${
                      imagePreview === img 
                        ? 'border-blue-500 ring-2 ring-blue-500/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setImagePreview(img);
                      handleInputChange('image', img);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Project Details
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter project name"
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
          </div>

          {/* Links and Developers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Links & Team
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Github className="w-4 h-4 inline mr-1" />
                GitHub Repository *
              </label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="https://github.com/username/repo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <ExternalLink className="w-4 h-4 inline mr-1" />
                Live Demo URL (Optional)
              </label>
              <input
                type="url"
                value={formData.liveUrl}
                onChange={(e) => handleInputChange('liveUrl', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="https://your-demo-site.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Developed By
              </label>
              <div className="space-y-2">
                {['Muhammad Qasim', 'Azmat Mustafa'].map((developer) => (
                  <label key={developer} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.developedBy.includes(developer)}
                      onChange={() => toggleDeveloper(developer)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {developer}
                    </span>
                  </label>
                ))}
              </div>
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
            {['React', 'TypeScript', 'Node.js', 'MongoDB', 'PostgreSQL', 'Tailwind CSS', 'Next.js', 'Express.js'].map((tech) => (
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
  );
};