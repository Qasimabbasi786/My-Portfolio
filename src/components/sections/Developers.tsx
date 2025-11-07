import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Edit } from 'lucide-react';
import { Button } from '../ui/Button';
import { SkillsEditor } from '../ui/SkillsEditor';
import type { Developer } from '../../types';

interface DevelopersProps {
  developers: Developer[];
  onEditDeveloper?: (developer: Developer) => void;
  isEditable?: boolean;
}

export const Developers: React.FC<DevelopersProps> = ({ 
  developers, 
  onEditDeveloper,
  isEditable = false 
}) => {
  return (
    <section id="developers" className="py-20 bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Meet Our Team
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Get to know the developers behind the exceptional digital experiences.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {developers.map((developer, index) => (
            <motion.div
              key={developer.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative group"
            >
              {/* Edit Button */}
              {isEditable && onEditDeveloper && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => onEditDeveloper(developer)}
                  className="absolute top-4 right-4 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
              )}

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <img
                      src={developer.profileImage}
                      alt={developer.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900/30 shadow-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full" />
                    
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10" />
                  </motion.div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {developer.name}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">
                  {developer.title}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {developer.description}
                </p>

                {/* Skills */}
                <div className="mb-6 w-full">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Skills & Expertise
                  </h4>
                  <div className="flex justify-center">
                    <SkillsEditor
                      skills={developer.skills}
                      onSkillsUpdate={() => {}} // Read-only in display mode
                      isEditing={false}
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap justify-center gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(developer.github, '_blank')}
                      className="flex items-center hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(developer.linkedin, '_blank')}
                      className="flex items-center hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`mailto:${developer.email}`, '_blank')}
                      className="flex items-center hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};