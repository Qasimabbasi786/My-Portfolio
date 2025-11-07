import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, LogOut, User, FolderOpen, Settings, RefreshCw, Edit, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { SupabaseDeveloperEditor } from '../admin/SupabaseDeveloperEditor';
import { SupabaseProjectEditor } from '../admin/SupabaseProjectEditor';
import { DevelopersService } from '../../services/developers';
import { ProjectsService } from '../../services/projects';
import type { Developer, ProjectWithDetails } from '../../lib/supabase';

interface DeveloperDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  developer: Developer;
  onLogout: () => void;
  onDeveloperUpdate?: (updatedDeveloper: Developer) => void;
}

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({
  isOpen,
  onClose,
  developer,
  onLogout,
  onDeveloperUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'projects'>('profile');
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithDetails | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [currentDeveloper, setCurrentDeveloper] = useState<Developer>(developer);

  useEffect(() => {
    setCurrentDeveloper(developer);
  }, [developer]);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ProjectsService.getProjectsByDeveloper(developer.id);
      if (result.success) {
        setProjects(result.data || []);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  const canEditProject = (project: ProjectWithDetails): boolean => {
    if (project.creator_id !== developer.id) {
      return false;
    }
    const createdAt = new Date(project.created_at);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceCreation < 24;
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="2xl">
      <div className="min-h-[600px]">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Developer Dashboard
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome back, {currentDeveloper.name}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center ${
              activeTab === 'projects'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Projects
          </button>
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'profile' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Profile
                </h3>
                <Button onClick={() => setEditingProfile(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <div className="flex items-start space-x-6">
                  <img
                    src={currentDeveloper.profile_picture || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200'}
                    alt={currentDeveloper.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {currentDeveloper.name}
                    </h4>
                    <p className="text-blue-600 dark:text-blue-400 mb-3">
                      {currentDeveloper.title}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {currentDeveloper.bio}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {currentDeveloper.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>Email:</strong> {currentDeveloper.email}
                      </p>
                      {currentDeveloper.github_link && (
                        <p className="text-gray-600 dark:text-gray-400">
                          <strong>GitHub:</strong>{' '}
                          <a
                            href={currentDeveloper.github_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {currentDeveloper.github_link}
                          </a>
                        </p>
                      )}
                      {currentDeveloper.linkedin && (
                        <p className="text-gray-600 dark:text-gray-400">
                          <strong>LinkedIn:</strong>{' '}
                          <a
                            href={currentDeveloper.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {currentDeveloper.linkedin}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Projects ({projects.length})
                </h3>
                <Button onClick={() => setIsCreatingProject(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-600 dark:text-red-400">
                  {error}
                  <Button variant="outline" size="sm" onClick={loadProjects} className="mt-4">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No projects yet. Add your first project to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {project.title}
                            </h4>
                            {project.featured && (
                              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded-full">
                                Featured
                              </span>
                            )}
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                project.status === 'active'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                  : project.status === 'draft'
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                              }`}
                            >
                              {project.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {canEditProject(project) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingProject(project)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="opacity-50 cursor-not-allowed"
                              title="Edit disabled: Only available within 24 hours of creation for your own projects"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {editingProfile && (
        <SupabaseDeveloperEditor
          developer={currentDeveloper}
          isOpen={true}
          isEditable={true}
          onClose={() => setEditingProfile(false)}
          onSave={async () => {
            setEditingProfile(false);
            const result = await DevelopersService.getDeveloperById(currentDeveloper.id);
            if (result.success && result.data) {
              setCurrentDeveloper(result.data);
              if (onDeveloperUpdate) {
                onDeveloperUpdate(result.data);
              }
            }
          }}
        />
      )}

      {(editingProject || isCreatingProject) && (
        <SupabaseProjectEditor
          project={editingProject}
          isOpen={true}
          onClose={() => {
            setEditingProject(null);
            setIsCreatingProject(false);
          }}
          onSave={() => {
            loadProjects();
            setEditingProject(null);
            setIsCreatingProject(false);
          }}
        />
      )}
    </Modal>
  );
};
