import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, Star, Edit, Trash2, Plus, Users, Zap, Code, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { SupabaseProjectEditor } from '../admin/SupabaseProjectEditor';
import { ProjectsService } from '../../services/projects';
import type { ProjectWithDetails } from '../../lib/supabase';

interface SupabaseProjectsProps {
  projects: ProjectWithDetails[];
  onRefresh: () => void;
  isEditable?: boolean;
}

export const SupabaseProjects: React.FC<SupabaseProjectsProps> = ({
  projects,
  onRefresh,
  isEditable = false
}) => {
  const [selectedProject, setSelectedProject] = useState<ProjectWithDetails | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectWithDetails | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [filter, setFilter] = useState<'all' | 'featured'>('all');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const filteredProjects = filter === 'featured' 
    ? projects.filter(project => project.featured)
    : projects;

  const handleEditProject = (project: ProjectWithDetails) => {
    setEditingProject(project);
  };

  const handleDeleteProject = async (project: ProjectWithDetails) => {
    if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
      const result = await ProjectsService.deleteProject(project.id);
      if (result.success) {
        onRefresh();
      } else {
        alert(result.message || 'Failed to delete project');
      }
    }
  };

  const handleSaveProject = () => {
    onRefresh();
    setEditingProject(null);
    setIsAddingProject(false);
  };

  return (
    <section id="projects" className="py-24 relative overflow-hidden">
      {/* Enhanced background with animated gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            background: [
              'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
              'radial-gradient(ellipse 60% 40% at 80% 60%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)',
              'radial-gradient(ellipse 70% 60% at 40% 20%, rgba(14, 165, 233, 0.08) 0%, transparent 50%)',
              'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0"
        />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full mb-6"
          >
            <Zap className="w-5 h-5 mr-2 text-blue-400" />
            <span className="text-blue-300 font-medium">Our Portfolio</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Crafted with
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Precision & Passion
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-10 leading-relaxed">
            Explore our portfolio of successful projects that showcase our expertise 
            in modern web development and innovative digital solutions.
          </p>

          {/* Enhanced Filter and Add buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="flex space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={filter === 'all' ? 'primary' : 'outline'}
                  onClick={() => setFilter('all')}
                  className={filter === 'all' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25' 
                    : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:border-blue-500/50 hover:text-white'
                  }
                >
                  <Code className="w-4 h-4 mr-2" />
                  All Projects ({projects.length})
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={filter === 'featured' ? 'primary' : 'outline'}
                  onClick={() => setFilter('featured')}
                  className={filter === 'featured' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25' 
                    : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:border-purple-500/50 hover:text-white'
                  }
                >
                  <Star className="w-4 h-4 mr-2" />
                  Featured ({projects.filter(p => p.featured).length})
                </Button>
              </motion.div>
            </div>
            
            {isEditable && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setIsAddingProject(true)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Project
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Enhanced Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -50 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  layout: { duration: 0.3 },
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -15, 
                  scale: 1.02,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                className="group relative cursor-pointer"
              >
                {/* Enhanced card with glassmorphism */}
                <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
                  
                  {/* Animated border gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-[1px] bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl" />
                  
                  {/* Edit/Delete buttons with enhanced styling */}
                  {isEditable && (
                    <div className="absolute top-4 right-4 z-20 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProject(project);
                        }}
                        className="p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project);
                        }}
                        className="p-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-red-500/50 transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}

                  <div
                    className="relative z-10"
                    onClick={() => {
                      setSelectedProject(project);
                      setSelectedImageIndex(0);
                    }}
                  >
                    {/* Enhanced project image */}
                    <div className="relative overflow-hidden">
                      <motion.img
                        src={
                          (project.project_images?.find(img => img.is_primary)?.image_url) ||
                          project.thumbnail ||
                          (project.project_images?.[0]?.image_url) ||
                          'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800'
                        }
                        alt={project.title}
                        className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                        whileHover={{ scale: 1.1 }}
                      />
                      
                      {/* Enhanced overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                      
                      {/* Enhanced badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {project.featured && (
                          <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center shadow-lg"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </motion.div>
                        )}
                        
                        {project.status !== 'active' && (
                          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
                            project.status === 'draft' 
                              ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                              : 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                          }`}>
                            {project.status}
                          </div>
                        )}
                      </div>

                      {/* Enhanced quick action overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <motion.div
                          initial={{ scale: 0 }}
                          whileHover={{ scale: 1 }}
                          className="bg-white/10 backdrop-blur-md rounded-full p-4 shadow-2xl border border-white/20"
                        >
                          <ExternalLink className="w-8 h-8 text-white" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Enhanced content section */}
                    <div className="p-6 relative z-10">
                      <motion.h3 
                        className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300"
                        whileHover={{ x: 5 }}
                      >
                        {project.title}
                      </motion.h3>
                      
                      <p className="text-slate-300 mb-4 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                      
                      {/* Enhanced Technologies */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.slice(0, 3).map((tech, techIndex) => (
                          <motion.span
                            key={tech}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: techIndex * 0.1 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-200 rounded-full text-sm font-medium hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300"
                          >
                            {tech}
                          </motion.span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-full text-sm font-medium border border-slate-600/50">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                      
                      {/* Enhanced Developer info */}
                      <div className="text-sm text-slate-400 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full mr-2"
                        />
                        {project.project_developers && project.project_developers.length > 0 ? (
                          <span>
                            {project.project_developers.map(pd => pd.developer?.name).filter(Boolean).join(' & ')}
                          </span>
                        ) : (
                          <span>No developers assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Enhanced Empty state */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ 
                rotateY: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotateY: { duration: 4, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-32 h-32 bg-gradient-to-br from-slate-800 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
            >
              <Github className="w-16 h-16 text-slate-400" />
            </motion.div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              No projects found
            </h3>
            <p className="text-slate-400 text-lg mb-8">
              {filter === 'featured' 
                ? "No featured projects available yet." 
                : "No projects have been added yet."}
            </p>
            {isEditable && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => setIsAddingProject(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Project
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Enhanced Project Detail Modal */}
        <Modal
          isOpen={selectedProject !== null}
          onClose={() => {
            setSelectedProject(null);
            setSelectedImageIndex(0);
          }}
          maxWidth="2xl"
        >
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Back Button */}
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 pb-4 mb-4 -mx-6 px-6 pt-2">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="font-medium">Back to Projects</span>
                </button>
              </div>

              {/* Image Carousel */}
              <div className="relative">
                {(() => {
                  const allImages = [];

                  if (selectedProject.thumbnail) {
                    allImages.push({
                      id: 'thumbnail',
                      image_url: selectedProject.thumbnail,
                      is_primary: true
                    });
                  }

                  if (selectedProject.project_images && selectedProject.project_images.length > 0) {
                    const sortedImages = [...selectedProject.project_images]
                      .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));

                    sortedImages.forEach(img => {
                      if (!allImages.some(existing => existing.image_url === img.image_url)) {
                        allImages.push(img);
                      }
                    });
                  }

                  if (allImages.length === 0) {
                    allImages.push({
                      id: 'default',
                      image_url: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
                      is_primary: true
                    });
                  }

                  return (
                    <div className="relative">
                      <img
                        src={allImages[selectedImageIndex]?.image_url || allImages[0].image_url}
                        alt={selectedProject.title}
                        className="w-full h-64 md:h-80 object-cover rounded-xl"
                      />
                      {allImages.length > 1 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                          {allImages.map((image, index) => (
                            <img
                              key={image.id}
                              src={image.image_url}
                              alt={`${selectedProject.title} - ${index + 1}`}
                              onClick={() => setSelectedImageIndex(index)}
                              className={`w-20 h-20 object-cover rounded-lg cursor-pointer transition-all flex-shrink-0 ${
                                selectedImageIndex === index
                                  ? 'ring-2 ring-blue-500 scale-105'
                                  : 'hover:ring-2 hover:ring-blue-400'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      {selectedProject.featured && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center shadow-lg">
                          <Star className="w-4 h-4 mr-1" />
                          Featured Project
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedProject.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-lg">
                  {selectedProject.description}
                </p>

                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                    Technologies Used
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedProject.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedProject.project_developers && selectedProject.project_developers.length > 0 && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-green-500" />
                      Development Team
                    </h4>
                    <div className="space-y-3">
                      {selectedProject.project_developers.map((pd) => (
                        <div key={pd.id} className="flex items-center space-x-4">
                          <img
                            src={pd.developer?.profile_picture || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100'}
                            alt={pd.developer?.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-600 shadow-lg"
                          />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {pd.developer?.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {pd.role}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  {selectedProject.github_link && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="primary"
                        onClick={() => window.open(selectedProject.github_link, '_blank')}
                        className="flex items-center w-full sm:w-auto bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        View Source Code
                      </Button>
                    </motion.div>
                  )}
                  
                  {selectedProject.live_demo_link && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedProject.live_demo_link, '_blank')}
                        className="flex items-center w-full sm:w-auto border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
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
          <SupabaseProjectEditor
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