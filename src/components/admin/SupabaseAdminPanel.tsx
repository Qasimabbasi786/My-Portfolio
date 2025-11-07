import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, FolderOpen, Settings, LogOut, Plus, CreditCard as Edit, Trash2, Upload, Image as ImageIcon, Activity, FileText, CircleAlert as AlertCircle, RefreshCw, Eye, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AdminLogin } from './AdminLogin';
import { AuditLogViewer } from './AuditLogViewer';
import { FileManager } from '../ui/FileManager';
import { SiteSettingsEditor } from './SiteSettingsEditor';
import { SupabaseDeveloperEditor } from './SupabaseDeveloperEditor';
import { SupabaseProjectEditor } from './SupabaseProjectEditor';
import { useAdminSession } from '../../hooks/useAdminSession';
import { DevelopersService } from '../../services/developers';
import { ProjectsService } from '../../services/projects';
import { AuditLogger } from '../../services/auditLogger';
import type { Developer, ProjectWithDetails, Admin } from '../../lib/supabase';

interface SupabaseAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdate?: () => void;
}

export const SupabaseAdminPanel: React.FC<SupabaseAdminPanelProps> = ({
  isOpen,
  onClose,
  onSettingsUpdate
}) => {
  const {
    isAuthenticated,
    admin,
    isLoading: sessionLoading,
    error: sessionError,
    isInitialized,
    login,
    logout,
    retry,
    clearError
  } = useAdminSession();
  
  const [activeTab, setActiveTab] = useState<'developers' | 'projects' | 'settings' | 'files' | 'audit'>('developers');
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showFileManager, setShowFileManager] = useState(false);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      loadData();
    }
  }, [isAuthenticated, isOpen]);

  const loadData = async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const [developersResult, projectsResult] = await Promise.all([
        DevelopersService.getAllDevelopers(),
        ProjectsService.getAllProjects(true)
      ]);

      if (developersResult.success) {
        setDevelopers(developersResult.data || []);
      }

      if (projectsResult.success) {
        setProjects(projectsResult.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setDataError('Failed to load data. Please try again.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleLoginSuccess = async (credentials: { username: string; password: string }) => {
    const result = await login(credentials);
    return result;
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleClose = () => {
    clearError();
    onClose();
  };

  const tabs = [
    { id: 'developers', label: 'Developers', icon: Users },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'audit', label: 'Audit Log', icon: Activity }
  ];

  if (!isOpen) return null;

  // Show loading state while initializing
  if (!isInitialized || sessionLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center space-x-4">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              Initializing Admin Panel...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        error={sessionError}
        onClearError={clearError}
        isLoading={sessionLoading}
        onClose={handleClose}
      />
    );
  }

  // Show unauthorized message if session error exists
  if (sessionError && isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Session Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {sessionError}
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={retry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button onClick={handleLogout}>
                Login Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Modal isOpen={true} onClose={handleClose} maxWidth="2xl">
      <div className="min-h-[700px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome back, {admin?.username}
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

        {/* Data Loading Error */}
        {dataError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <span className="text-red-800 dark:text-red-200">{dataError}</span>
              </div>
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'developers' && (
                <DevelopersTab 
                  developers={developers} 
                  onRefresh={loadData}
                  isLoading={dataLoading}
                />
              )}
              {activeTab === 'projects' && (
                <ProjectsTab 
                  projects={projects} 
                  developers={developers}
                  onRefresh={loadData}
                  isLoading={dataLoading}
                />
              )}
              {activeTab === 'settings' && (
                <SettingsTab admin={admin} onSettingsUpdate={onSettingsUpdate} />
              )}
              {activeTab === 'files' && (
                <FilesTab onOpenFileManager={() => setShowFileManager(true)} />
              )}
              {activeTab === 'audit' && (
                <AuditTab onOpenAuditLog={() => setShowAuditLog(true)} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* File Manager Modal */}
      <FileManager
        isOpen={showFileManager}
        onClose={() => setShowFileManager(false)}
      />

      {/* Audit Log Modal */}
      <AuditLogViewer
        isOpen={showAuditLog}
        onClose={() => setShowAuditLog(false)}
      />
    </Modal>
  );
};

// Sortable Developer Item Component
const SortableDeveloperItem: React.FC<{
  developer: Developer;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ developer, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: developer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <GripVertical className="w-5 h-5 text-gray-400" />
          </button>
          <img
            src={developer.profile_picture || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100'}
            alt={developer.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {developer.name}
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {developer.title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {developer.email}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Developers Tab Component
const DevelopersTab: React.FC<{
  developers: Developer[];
  onRefresh: () => void;
  isLoading: boolean;
}> = ({ developers, onRefresh, isLoading }) => {
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [orderedDevelopers, setOrderedDevelopers] = useState<Developer[]>(developers);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    setOrderedDevelopers(developers);
  }, [developers]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = orderedDevelopers.findIndex(d => d.id === active.id);
      const newIndex = orderedDevelopers.findIndex(d => d.id === over.id);
      
      const newOrder = arrayMove(orderedDevelopers, oldIndex, newIndex);
      setOrderedDevelopers(newOrder);
      
      // Update display_order in database
      const updates = newOrder.map((dev, index) => ({
        id: dev.id,
        display_order: index
      }));
      
      const result = await DevelopersService.updateDevelopersOrder(updates);
      if (!result.success) {
        alert(result.message);
        setOrderedDevelopers(developers); // Revert on error
      } else {
        onRefresh(); // Refresh to get updated data
      }
    }
  };

  const handleDelete = async (developer: Developer) => {
    if (window.confirm(`Are you sure you want to delete ${developer.name}?`)) {
      const result = await DevelopersService.deleteDeveloper(developer.id);
      if (result.success) {
        await AuditLogger.logDelete('developers', developer.id, developer);
        onRefresh();
      } else {
        alert(result.message);
      }
    }
  };

  const handleSave = () => {
    onRefresh();
    setEditingDeveloper(null);
    setIsCreating(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Developers ({developers.length})
          </h3>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Developer
          </Button>
        </div>

        {developers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No developers found. Add your first developer to get started.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedDevelopers.map(d => d.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {orderedDevelopers.map((developer) => (
                  <SortableDeveloperItem
                    key={developer.id}
                    developer={developer}
                    onEdit={() => setEditingDeveloper(developer)}
                    onDelete={() => handleDelete(developer)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Developer Editor Modal */}
      {(editingDeveloper || isCreating) && (
        <SupabaseDeveloperEditor
          developer={editingDeveloper || { id: 'new' } as Developer}
          isOpen={true}
          onClose={() => {
            setEditingDeveloper(null);
            setIsCreating(false);
          }}
          onSave={handleSave}
        />
      )}
    </>
  );
};

// Sortable Project Item Component
const SortableProjectItem: React.FC<{
  project: ProjectWithDetails;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ project, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded mt-1"
          >
            <GripVertical className="w-5 h-5 text-gray-400" />
          </button>
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
              <span className={`px-2 py-1 text-xs rounded-full ${
                project.status === 'active'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  : project.status === 'draft'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              }`}>
                {project.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {project.description}
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <span>{project.technologies.length} technologies</span>
              <span>{project.project_images?.length || 0} images</span>
              <span>{project.project_developers?.length || 0} developers</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Projects Tab Component
const ProjectsTab: React.FC<{
  projects: ProjectWithDetails[];
  developers: Developer[];
  onRefresh: () => void;
  isLoading: boolean;
}> = ({ projects, developers, onRefresh, isLoading }) => {
  const [editingProject, setEditingProject] = useState<ProjectWithDetails | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [orderedProjects, setOrderedProjects] = useState<ProjectWithDetails[]>(projects);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    setOrderedProjects(projects);
  }, [projects]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = orderedProjects.findIndex(p => p.id === active.id);
      const newIndex = orderedProjects.findIndex(p => p.id === over.id);
      
      const newOrder = arrayMove(orderedProjects, oldIndex, newIndex);
      setOrderedProjects(newOrder);
      
      // Update display_order in database
      const updates = newOrder.map((proj, index) => ({
        id: proj.id,
        display_order: index
      }));
      
      const result = await ProjectsService.updateProjectsOrder(updates);
      if (!result.success) {
        alert(result.message);
        setOrderedProjects(projects); // Revert on error
      } else {
        onRefresh(); // Refresh to get updated data
      }
    }
  };

  const handleDelete = async (project: ProjectWithDetails) => {
    if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
      const result = await ProjectsService.deleteProject(project.id);
      if (result.success) {
        await AuditLogger.logDelete('projects', project.id, project);
        onRefresh();
      } else {
        alert(result.message);
      }
    }
  };

  const handleSave = () => {
    onRefresh();
    setEditingProject(null);
    setIsCreating(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Projects ({projects.length})
          </h3>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No projects found. Add your first project to get started.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedProjects.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {orderedProjects.map((project) => (
                  <SortableProjectItem
                    key={project.id}
                    project={project}
                    onEdit={() => setEditingProject(project)}
                    onDelete={() => handleDelete(project)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Project Editor Modal */}
      {(editingProject || isCreating) && (
        <SupabaseProjectEditor
          project={editingProject}
          isOpen={true}
          onClose={() => {
            setEditingProject(null);
            setIsCreating(false);
          }}
          onSave={handleSave}
        />
      )}
    </>
  );
};

// Settings Tab Component
const SettingsTab: React.FC<{
  admin: Admin | null;
  onSettingsUpdate?: () => void;
}> = ({ onSettingsUpdate }) => {
  return (
    <div className="space-y-6">
      <SiteSettingsEditor onSettingsUpdate={onSettingsUpdate} />
    </div>
  );
};

// Files Tab Component
const FilesTab: React.FC<{
  onOpenFileManager: () => void;
}> = ({ onOpenFileManager }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        File Management
      </h3>
      
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Manage uploaded files, images, and videos across all storage buckets.
        </p>
        <Button onClick={onOpenFileManager}>
          <FolderOpen className="w-4 h-4 mr-2" />
          Open File Manager
        </Button>
      </div>
    </div>
  );
};

// Audit Tab Component
const AuditTab: React.FC<{
  onOpenAuditLog: () => void;
}> = ({ onOpenAuditLog }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Audit & Security
      </h3>
      
      <div className="text-center py-12">
        <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          View detailed logs of all admin actions and system changes.
        </p>
        <Button onClick={onOpenAuditLog}>
          <Activity className="w-4 h-4 mr-2" />
          View Audit Log
        </Button>
      </div>
    </div>
  );
};