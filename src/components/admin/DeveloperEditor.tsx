import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X, User, Mail, Github, Linkedin, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ImageUpload } from '../ui/ImageUpload';
import { SkillsEditor } from '../ui/SkillsEditor';
import type { Developer } from '../../types';

interface DeveloperEditorProps {
  developer: Developer;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Developer>) => void;
}

export const DeveloperEditor: React.FC<DeveloperEditorProps> = ({
  developer,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Developer>(developer);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSave(formData);
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (field: keyof Developer, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillsUpdate = (skills: string[]) => {
    setFormData(prev => ({ ...prev, skills }));
  };

  const handleImageUpdate = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, profileImage: imageUrl }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${developer.name}'s Profile`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Profile Picture
          </h3>
          <ImageUpload
            currentImage={formData.profileImage}
            onImageUpdate={async (imageUrl) => {
              handleImageUpdate(imageUrl);
            }}
            uploadType="avatar"
            cropShape="round"
            aspectRatio={1}
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
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Professional Title
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
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                required
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
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Github className="w-4 h-4 inline mr-1" />
                GitHub Profile
              </label>
              <input
                type="url"
                value={formData.github}
                onChange={(e) => handleInputChange('github', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="https://github.com/username"
                required
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
                required
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </motion.div>
        </div>
      </form>
    </Modal>
  );
};