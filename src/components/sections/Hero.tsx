import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import type { SiteSettings } from '../../services/siteSettings';

interface HeroProps {
  siteSettings: Partial<SiteSettings>;
}

export const Hero: React.FC<HeroProps> = ({ siteSettings }) => {
  const scrollToProjects = () => {
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Floating particles data
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
  }));

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Base Dark Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-black" />

      {/* Animated Gradient Waves Layer 1 */}
      <motion.div
        animate={{
          background: [
            'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(168, 85, 247, 0.15) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(ellipse 60% 40% at 40% 20%, rgba(236, 72, 153, 0.15) 0%, transparent 50%), radial-gradient(ellipse 80% 50% at 60% 80%, rgba(14, 165, 233, 0.15) 0%, transparent 50%)',
            'radial-gradient(ellipse 70% 60% at 80% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 50%), radial-gradient(ellipse 50% 30% at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(168, 85, 247, 0.15) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0"
      />

      {/* Animated Gradient Waves Layer 2 */}
      <motion.div
        animate={{
          background: [
            'radial-gradient(ellipse 90% 70% at 70% 30%, rgba(14, 165, 233, 0.1) 0%, transparent 60%), radial-gradient(ellipse 50% 80% at 30% 70%, rgba(236, 72, 153, 0.1) 0%, transparent 60%)',
            'radial-gradient(ellipse 60% 50% at 90% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 10% 20%, rgba(14, 165, 233, 0.1) 0%, transparent 60%)',
            'radial-gradient(ellipse 70% 90% at 20% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 60%), radial-gradient(ellipse 40% 70% at 80% 40%, rgba(168, 85, 247, 0.1) 0%, transparent 60%)',
            'radial-gradient(ellipse 90% 70% at 70% 30%, rgba(14, 165, 233, 0.1) 0%, transparent 60%), radial-gradient(ellipse 50% 80% at 30% 70%, rgba(236, 72, 153, 0.1) 0%, transparent 60%)',
          ],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0"
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.sin(particle.id) * 20, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        />
        
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -80, 0],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Glassmorphism Container */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
          >
            {/* Greeting Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mb-6"
            >
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-400 mr-2" />
                <span className="text-purple-300 text-lg font-medium tracking-wide">
                  Welcome to Our Digital World
                </span>
                <Sparkles className="w-6 h-6 text-purple-400 ml-2" />
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8"
            >
              <span className="block text-white mb-2">Hi, We are</span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Muhammad Qasim
              </span>
              <span className="block text-white text-3xl md:text-4xl lg:text-5xl mt-2 mb-2">&</span>
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Azmat Mustafa
              </span>
              <span className="block text-white text-2xl md:text-3xl lg:text-4xl mt-4 font-light">
                {siteSettings.hero_title || 'Web Developers'}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              {siteSettings.hero_subtitle || 'Crafting exceptional digital experiences with cutting-edge technology and innovative design solutions for clients worldwide.'}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  onClick={scrollToProjects}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 group"
                >
                  View Our Work
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={scrollToContact}
                  className="border-2 border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 hover:border-cyan-400 px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-all duration-300 group"
                >
                  Contact Us
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="ml-2"
                  >
                    👋
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center text-gray-400"
        >
          <span className="text-sm mb-2 font-light">Discover More</span>
          <div className="w-6 h-10 border-2 border-gray-400/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};