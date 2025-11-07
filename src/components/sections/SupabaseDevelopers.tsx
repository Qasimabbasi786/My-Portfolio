import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Linkedin, Mail, Edit, Star, Award, Code2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { SkillsEditor } from '../ui/SkillsEditor';
import type { Developer } from '../../lib/supabase';

interface SupabaseDevelopersProps {
  developers: Developer[];
  onEditDeveloper?: (developer: Developer) => void;
  isEditable?: boolean;
}

export const SupabaseDevelopers: React.FC<SupabaseDevelopersProps> = ({
  developers,
  onEditDeveloper,
  isEditable = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const showCarousel = developers.length > 2;
  const itemsPerView = 2;
  const maxIndex = Math.max(0, developers.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  useEffect(() => {
    if (showCarousel && !isPaused) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [showCarousel, isPaused, currentIndex, maxIndex]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <section id="developers" className="py-24 relative overflow-hidden">
      {/* Enhanced background with animated gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            background: [
              'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
              'radial-gradient(ellipse 60% 40% at 80% 60%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
              'radial-gradient(ellipse 70% 60% at 40% 20%, rgba(14, 165, 233, 0.1) 0%, transparent 50%)',
              'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0"
        />
        
        {/* Floating particles */}
        {Array.from({ length: 30 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.sin(i) * 20, 0],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
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
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded-full mb-6"
          >
            <Award className="w-5 h-5 mr-2 text-purple-400" />
            <span className="text-purple-300 font-medium">Meet Our Expert Team</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              The Minds Behind
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Digital Excellence
            </span>
          </h2>
          <p className="text-xl text-slate-300 leading-relaxed">
            Get to know the passionate developers who craft exceptional digital experiences 
            with cutting-edge technology and innovative solutions.
          </p>
        </motion.div>

        {!showCarousel ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {developers.map((developer, index) => (
              <motion.div
                key={developer.id}
                initial={{ opacity: 0, y: 50, rotateY: index % 2 === 0 ? -15 : 15 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                whileHover={{
                  y: -10,
                  rotateY: index % 2 === 0 ? 2 : -2,
                  transition: { duration: 0.3 }
                }}
                className="group relative"
              >
                <DeveloperCard
                  developer={developer}
                  index={index}
                  isEditable={isEditable}
                  onEditDeveloper={onEditDeveloper}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div
            className="relative max-w-7xl mx-auto"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="overflow-hidden">
              <motion.div
                className="flex gap-12"
                animate={{
                  x: `-${currentIndex * (100 / itemsPerView)}%`
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              >
                {developers.map((developer, index) => (
                  <div
                    key={developer.id}
                    className="group relative"
                    style={{
                      minWidth: `calc(${100 / itemsPerView}% - ${(12 * (itemsPerView - 1)) / itemsPerView}px)`,
                      flexShrink: 0
                    }}
                  >
                    <DeveloperCard
                      developer={developer}
                      index={index}
                      isEditable={isEditable}
                      onEditDeveloper={onEditDeveloper}
                    />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Navigation Controls */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>

            {/* Pagination Dots */}
            <div className="flex justify-center mt-12 gap-3">
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentIndex
                      ? 'w-10 h-3 bg-gradient-to-r from-purple-500 to-cyan-500'
                      : 'w-3 h-3 bg-slate-600 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state with enhanced styling */}
        {developers.length === 0 && (
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
              <Code2 className="w-16 h-16 text-slate-400" />
            </motion.div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              No developers found
            </h3>
            <p className="text-slate-400 text-lg">
              No developers have been added yet.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

interface DeveloperCardProps {
  developer: Developer;
  index: number;
  isEditable: boolean;
  onEditDeveloper?: (developer: Developer) => void;
}

const DeveloperCard: React.FC<DeveloperCardProps> = ({
  developer,
  index,
  isEditable,
  onEditDeveloper
}) => (
  <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 overflow-hidden shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 h-full">
    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="absolute inset-[1px] bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl" />

    <div className="relative z-10">
      {isEditable && onEditDeveloper && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onEditDeveloper(developer)}
          className="absolute top-4 right-4 p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:shadow-purple-500/50"
        >
          <Edit className="w-4 h-4" />
        </motion.button>
      )}

      <div className="flex flex-col items-center text-center">
        <div className="relative mb-8">
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 10 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full opacity-20 blur-sm"
            />

            <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-slate-700/50 shadow-2xl">
              <img
                src={developer.profile_picture || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300'}
                alt={developer.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-3 border-slate-800 shadow-lg"
            />

            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              {developer.name}
            </span>
          </h3>
          <div className="flex items-center justify-center mb-4">
            <Code2 className="w-5 h-5 mr-2 text-purple-400" />
            <p className="text-lg font-medium bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {developer.title}
            </p>
          </div>

          {developer.bio && (
            <p className="text-slate-300 leading-relaxed max-w-md mx-auto">
              {developer.bio}
            </p>
          )}
        </motion.div>

        {developer.skills && developer.skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 w-full"
          >
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center justify-center">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              Skills & Expertise
            </h4>
            <div className="flex justify-center">
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {developer.skills.map((skill, skillIndex) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: skillIndex * 0.1 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-purple-200 rounded-full text-sm font-medium hover:from-purple-600/30 hover:to-blue-600/30 transition-all duration-300 cursor-default"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {developer.github_link && (
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(developer.github_link, '_blank')}
                className="flex items-center bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600 hover:border-purple-500/50 text-slate-200 hover:text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </motion.div>
          )}

          {developer.linkedin && (
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(developer.linkedin, '_blank')}
                className="flex items-center bg-gradient-to-r from-blue-800/50 to-blue-700/50 border-blue-600 hover:border-blue-500/50 text-blue-200 hover:text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
            </motion.div>
          )}

          {developer.email && (
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`mailto:${developer.email}`, '_blank')}
                className="flex items-center bg-gradient-to-r from-purple-800/50 to-purple-700/50 border-purple-600 hover:border-purple-500/50 text-purple-200 hover:text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  </div>
);