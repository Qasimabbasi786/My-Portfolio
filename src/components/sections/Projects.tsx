import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, Star, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ProjectEditor } from '../admin/ProjectEditor';
import type { Project } from '../../types';

interface ProjectsProps {
  projects: Project[];
  onUpdateProject?: (id: string, updates: Partial<Project>) => void;
  onDeleteProject?: (id: string) => void;
  onAddProject?: (project: Omit<Project, 'id'>) => void;
  isEditable?: boolean;
}

export const Projects: React.FC<ProjectsProps> = ({ 
  projects, 
  onUpdateProject,
  onDeleteProject,
  onAddProject,
  isEditable = false 
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  const filteredProjects = filter === 'featured' 
    ? projects.filter(project => project.featured)
    : projects;

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  const handleDeleteProject = (project: Project) => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      onDeleteProject?.(project.id);
    }
  };

  const handleSaveProject = (projectData: Omit<Project, 'id'>) => {
    if (editingProject) {
      onUpdateProject?.(editingProject.id, projectData);
    } else {
      onAddProject?.(projectData);
    }
    setEditingProject(null);
    setIsAddingProject(false);
  };

  return (
    <section id="projects" className="py-20 bg-white dark:bg-gray-900 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Our Projects
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Explore our portfolio of successful projects that showcase our expertise 
            in modern web development.
          </p>

          {/* Filter and Add buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex space-x-4">
              <Button
                variant={filter === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All Projects ({projects.length})
              </Button>
              <Button
                variant={filter === 'featured' ? 'primary' : 'outline'}
                onClick={() => setFilter('featured')}
              >
                Featured ({projects.filter(p => p.featured).length})
              </Button>
            </div>
            
            {isEditable && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setIsAddingProject(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-green-500/25"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Project
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -50 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  layout: { duration: 0.3 }
                }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer group relative"
              >
                {/* Edit/Delete buttons for admin */}
                {isEditable && (
                  <div className="absolute top-4 right-4 z-10 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project);
                      }}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project);
                      }}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}

                <div 
                  className="relative overflow-hidden"
                  onClick={() => setSelectedProject(project)}
                >
                  <motion.img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                    whileHover={{ scale: 1.1 }}
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Featured badge */}
                  {project.featured && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs flex items-center shadow-lg"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </motion.div>
                  )}

                  {/* Quick action overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-3 shadow-xl"
                    >
                      <ExternalLink className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </motion.div>
                  </div>
                </div>

                <div className="p-6">
                  <motion.h3 
                    className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300"
                    whileHover={{ x: 5 }}
                  >
                    {project.name}
                  </motion.h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                  
                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.slice(0, 3).map((tech, techIndex) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: techIndex * 0.1 }}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-300"
                      >
                        {tech}
                      </motion.span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>
                  
                  {/* Developer info */}
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Developed by: {project.developedBy.join(' & ')}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Github className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'featured' 
                ? "No featured projects available yet." 
                : "No projects have been added yet."}
            </p>
            {isEditable && (
              <Button onClick={() => setIsAddingProject(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Project
              </Button>
            )}
          </motion.div>
        )}

        {/* Project Detail Modal */}
        <Modal
          isOpen={selectedProject !== null}
          onClose={() => setSelectedProject(null)}
          maxWidth="2xl"
        >
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="relative">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                {selectedProject.featured && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm flex items-center shadow-lg">
                    <Star className="w-4 h-4 mr-1" />
                    Featured Project
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedProject.name}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {selectedProject.description}
                </p>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Technologies Used
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-white">Developed by:</strong> {selectedProject.developedBy.join(' & ')}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="primary"
                      onClick={() => window.open(selectedProject.githubUrl, '_blank')}
                      className="flex items-center w-full sm:w-auto"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      View Source Code
                    </Button>
                  </motion.div>
                  
                  {selectedProject.liveUrl && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedProject.liveUrl, '_blank')}
                        className="flex items-center w-full sm:w-auto"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Live Demo
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </Modal>

        {/* Project Editor Modal */}
        {(editingProject || isAddingProject) && (
          <ProjectEditor
            project={editingProject}
            isOpen={true}
            onClose={() => {
              setEditingProject(null);
              setIsAddingProject(false);
            }}
            onSave={handleSaveProject}
          />
        )}
      </div>
    </section>
  );
};