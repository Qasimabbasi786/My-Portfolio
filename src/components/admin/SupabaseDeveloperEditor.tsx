import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, User, Mail, Github, Linkedin, FileText, Eye, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ImageUpload } from '../ui/ImageUpload';
import { SkillsEditor } from '../ui/SkillsEditor';
import { DevelopersService } from '../../services/developers';
import { AuditLogger } from '../../services/auditLogger';
import { useToast, ToastContainer } from '../ui/Toast';
import type { Developer } from '../../lib/supabase';

interface SupabaseDeveloperEditorProps {
  developer?: Developer | null;
  isOpen: boolean;
  isEditable?: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const SupabaseDeveloperEditor: React.FC<SupabaseDeveloperEditorProps> = ({
  developer,
  isOpen,
  isEditable = false,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    github_link: '',
    linkedin: '',
    title: '',
    skills: [] as string[],
    profile_picture: '',
    bio: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Initialize form data when developer changes
  useEffect(() => {
    if (developer && developer.id !== 'new') {
      setFormData({
        name: developer.name || '',
        email: developer.email || '',
        password: '',
        github_link: developer.github_link || '',
        linkedin: developer.linkedin || '',
        title: developer.title || '',
        skills: developer.skills || [],
        profile_picture: developer.profile_picture || '',
        bio: developer.bio || ''
      });
    } else {
      // Reset form for new developer
      setFormData({
        name: '',
        email: '',
        password: '',
        github_link: '',
        linkedin: '',
        title: '',
        skills: [],
        profile_picture: '',
        bio: ''
      });
    }
  }, [developer]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSkillsUpdate = (skills: string[]) => {
    setFormData(prev => ({ ...prev, skills }));
  };

  const handleImageUpdate = async (imageUrl: string) => {
    setFormData(prev => ({ ...prev, profile_picture: imageUrl }));
  };

  const previewDeveloper = () => {
    // Scroll to developers section on main site
    window.open('/#developers', '_blank');
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate name
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    // Validate email
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Validate password for new developers
    if (developer?.id === 'new' && !formData.password.trim()) {
      errors.password = 'Password is required for new developers';
    } else if (formData.password.trim() && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      if (developer && developer.id !== 'new') {
        // Update existing developer (exclude password if empty)
        const updateData = { ...formData };
        if (!updateData.password.trim()) {
          delete (updateData as any).password;
        }
        const result = await DevelopersService.updateDeveloper(developer.id, updateData);
        if (result.success) {
          await AuditLogger.logUpdate('developers', developer.id, developer, result.data || {});
          toast.success('Success', 'Developer updated successfully!');
          onSave();
          onClose();
        } else {
          toast.error('Update Failed', result.message || 'Failed to update developer');
        }
      } else {
        // Create new developer
        const result = await DevelopersService.createDeveloper(formData);
        if (result.success) {
          await AuditLogger.logCreate('developers', result.data?.id || '', formData);
          toast.success('Success', 'Developer created successfully!');
          onSave();
          onClose();
        } else {
          toast.error('Creation Failed', result.message || 'Failed to create developer');
        }
      }
    } catch (error) {
      console.error('Error saving developer:', error);
      toast.error('Error', 'An unexpected error occurred while saving the developer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={developer?.id !== 'new' ? `Edit ${developer?.name || 'Developer'}'s Profile` : 'Create New Developer'}
      maxWidth="2xl"
    >
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Profile Picture
          </h3>
          <ImageUpload
            currentImage={formData.profile_picture}
            onImageUpdate={handleImageUpdate}
            uploadType={developer?.id === 'new' ? 'avatar' : 'developer'}
            cropShape="round"
            aspectRatio={1}
            developerId={developer?.id === 'new' ? undefined : developer?.id}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Click to upload a new profile picture. You can crop it before saving.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <User className="w-5 h-5 mr-2" />
              Basic Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  validationErrors.name
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent transition-all duration-300`}
                placeholder="Enter full name"
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Professional Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="e.g., Full Stack Developer"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Bio/Description
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Tell us about yourself, your experience, and what you're passionate about..."
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Contact & Social
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  validationErrors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent transition-all duration-300`}
                placeholder="Enter email address"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Lock className="w-4 h-4 inline mr-1" />
                Password {developer?.id === 'new' ? '*' : '(leave blank to keep current)'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  validationErrors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent transition-all duration-300`}
                placeholder="Enter password"
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Github className="w-4 h-4 inline mr-1" />
                GitHub Profile
              </label>
              <input
                type="url"
                value={formData.github_link}
                onChange={(e) => handleInputChange('github_link', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="https://github.com/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Linkedin className="w-4 h-4 inline mr-1" />
                LinkedIn Profile
              </label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Skills & Expertise
          </h3>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <SkillsEditor
              skills={formData.skills}
              onSkillsUpdate={handleSkillsUpdate}
              isEditing={true}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add your technical skills, programming languages, frameworks, and tools you work with.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          {developer?.id !== 'new' && (
            <Button
              type="button"
              variant="outline"
              onClick={previewDeveloper}
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
              {isSubmitting ? 'Saving...' : (developer?.id !== 'new' ? 'Update Developer' : 'Create Developer')}
            </Button>
          </motion.div>
        </div>
      </form>
    </Modal>
  );
};