import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit, Trash2, Save, Github, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { DeveloperEditor } from './DeveloperEditor';
import { Projects } from '../sections/Projects';
import { fetchGitHubRepos, convertGitHubRepoToProject } from '../../services/github';
import type { AppData, Developer, Project } from '../../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  updateDeveloper: (id: string, updates: Partial<Developer>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  deleteProject: (id: string) => void;
  updateSiteSettings: (updates: Partial<AppData['siteSettings']>) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  data,
  updateDeveloper,
  updateProject,
  addProject,
  deleteProject,
  updateSiteSettings
}) => {
  const [activeTab, setActiveTab] = useState<'developers' | 'projects' | 'settings' | 'github'>('developers');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleImportFromGitHub = async () => {
    setIsImporting(true);
    try {
      const repos = await fetchGitHubRepos('Qasimabbasi786');
      const projects = repos.slice(0, 5).map(repo => 
        convertGitHubRepoToProject(repo, ['Muhammad Qasim', 'Azmat Mustafa'])
      );
      
      projects.forEach(project => addProject(project));
      alert(`Successfully imported ${projects.length} projects from GitHub!`);
    } catch (error) {
      alert('Failed to import from GitHub. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const tabs = [
    { id: 'developers', label: 'Developers' },
    { id: 'projects', label: 'Projects' },
    { id: 'settings', label: 'Site Settings' },
    { id: 'github', label: 'GitHub Import' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="min-h-[600px]">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Panel
          </h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'developers' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Manage Developers
                    </h3>
                  </div>
                  
                  {data.developers.map((developer) => (
                    <div
                      key={developer.id}
                      className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={developer.profileImage}
                            alt={developer.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900/30"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white text-lg">
                              {developer.name}
                            </h4>
                            <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                              {developer.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {developer.skills.slice(0, 3).join(', ')}
                              {developer.skills.length > 3 && ` +${developer.skills.length - 3} more`}
                            </p>
                          </div>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingDeveloper(developer)}
                            className="flex items-center"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Manage Projects
                    </h3>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <Projects 
                      projects={data.projects}
                      onUpdateProject={updateProject}
                      onDeleteProject={deleteProject}
                      onAddProject={addProject}
                      isEditable={true}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Site Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hero Title
                      </label>
                      <input
                        type="text"
                        value={data.siteSettings.heroTitle}
                        onChange={(e) => updateSiteSettings({ heroTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hero Subtitle
                      </label>
                      <textarea
                        value={data.siteSettings.heroSubtitle}
                        onChange={(e) => updateSiteSettings({ heroSubtitle: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'github' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Import from GitHub
                  </h3>
                  
                  <div className="text-center py-12">
                    <Github className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Import your latest repositories from GitHub to showcase as projects.
                    </p>
                    <Button
                      onClick={handleImportFromGitHub}
                      disabled={isImporting}
                      size="lg"
                    >
                      {isImporting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      ) : (
                        <Github className="w-5 h-5 mr-2" />
                      )}
                      {isImporting ? 'Importing...' : 'Import from GitHub'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(data) => {
            if (editingItem.type === 'project') {
              if (editingItem.data) {
                updateProject(editingItem.data.id, data);
              } else {
                addProject(data);
              }
            }
            setEditingItem(null);
          }}
        />
      )}

      {/* Developer Editor Modal */}
      {editingDeveloper && (
        <DeveloperEditor
          developer={editingDeveloper}
          isOpen={true}
          onClose={() => setEditingDeveloper(null)}
          onSave={(updates) => updateDeveloper(editingDeveloper.id, updates)}
        />
      )}
    </Modal>
  );
};

const EditModal: React.FC<{
  item: any;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    item.data || {
      name: '',
      title: '',
      description: '',
      technologies: [],
      githubUrl: '',
      liveUrl: '',
      featured: false,
      developedBy: ['Muhammad Qasim', 'Azmat Mustafa']
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="xl" title={
      item.type === 'developer' ? 'Edit Developer' : 
      item.data ? 'Edit Project' : 'Add Project'
    }>
      <form onSubmit={handleSubmit} className="space-y-4">
        {item.type === 'developer' ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Project Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">GitHub URL</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="mr-2"
                />
                Featured Project
              </label>
            </div>
          </>
        )}
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};