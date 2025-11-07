import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Smartphone, Brain, TrendingUp, Shield, Sparkles, Rocket } from 'lucide-react';
import type { SiteSettings } from '../../services/siteSettings';

const features = [
  {
    icon: Code2,
    title: 'Web Development Excellence',
    description: 'From responsive websites to complex web applications, we build scalable, high-performance solutions that captivate users and drive business growth across all platforms and devices.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Smartphone,
    title: 'Mobile App Innovation',
    description: 'Native and cross-platform mobile experiences that engage users on iOS and Android. We transform ideas into intuitive, feature-rich apps that people love to use every day.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Brain,
    title: 'AI & Intelligent Solutions',
    description: 'Harness the power of artificial intelligence and machine learning to automate processes, gain insights, and create intelligent systems that evolve with your business needs.',
    gradient: 'from-violet-500 to-indigo-500'
  },
  {
    icon: TrendingUp,
    title: 'Digital Marketing & Growth',
    description: 'Strategic digital marketing campaigns, brand development, and SEO optimization that amplify your reach, build authority, and convert visitors into loyal customers.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Shield,
    title: 'Cyber Security & Protection',
    description: 'Enterprise-grade security solutions that safeguard your digital assets. From penetration testing to secure architecture, we protect what matters most to your business.',
    gradient: 'from-red-500 to-rose-500'
  },
  {
    icon: Sparkles,
    title: 'Creative & Scalable Design',
    description: 'Stunning visual experiences backed by technical excellence. We craft designs that not only look exceptional but scale seamlessly as your business grows globally.',
    gradient: 'from-yellow-500 to-orange-500'
  }
];

interface AboutProps {
  siteSettings?: Partial<SiteSettings>;
}

export const About: React.FC<AboutProps> = ({ siteSettings = {} }) => {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      {/* Enhanced background with animated gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            background: [
              'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(168, 85, 247, 0.06) 0%, transparent 50%)',
              'radial-gradient(ellipse 60% 40% at 80% 60%, rgba(59, 130, 246, 0.06) 0%, transparent 50%)',
              'radial-gradient(ellipse 70% 60% at 40% 20%, rgba(14, 165, 233, 0.06) 0%, transparent 50%)',
              'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(168, 85, 247, 0.06) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0"
        />
        
        {/* Floating geometric shapes */}
        {Array.from({ length: 20 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-400/20 to-cyan-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.sin(i) * 30, 0],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 15 + 15,
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
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-full mb-6"
          >
            <Rocket className="w-5 h-5 mr-2 text-purple-400" />
            <span className="text-purple-300 font-medium">Our Expertise</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Full-Stack Digital
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Innovation Experts
            </span>
          </h2>
          <p className="text-xl text-slate-300 leading-relaxed mb-4">
            {siteSettings.about_text || 'Welcome to Globex Collection, where innovation meets excellence. Founded by Muhammad Qasim and Azmat Mustafa, we are a world-class digital innovation agency specializing in comprehensive technology solutions that empower businesses to thrive in the digital age.'}
          </p>
          <p className="text-lg text-slate-400 leading-relaxed italic">
            Turning ideas into digital realities that inspire trust and drive success worldwide.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, rotateX: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.15,
                type: "spring",
                stiffness: 100
              }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -10, 
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
              className="group relative"
            >
              {/* Enhanced card with glassmorphism */}
              <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 overflow-hidden shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 h-full">
                
                {/* Animated border gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-[1px] bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl" />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Enhanced icon with animated background */}
                  <div className="relative mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    {/* Glow effect */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
                    />
                  </div>
                  
                  <motion.h3 
                    className="text-xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300"
                    whileHover={{ x: 5 }}
                  >
                    {feature.title}
                  </motion.h3>
                  
                  <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                    {feature.description}
                  </p>
                  
                  {/* Animated accent line */}
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                    className={`h-0.5 bg-gradient-to-r ${feature.gradient} mt-6 rounded-full`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced call-to-action section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full blur-xl"
            />
            <div className="relative bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Partner With Global Innovators
              </h3>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                Join leading businesses worldwide who trust Globex Collection to deliver transformative digital solutions.
                From startups to enterprises, we're committed to your success with quality, creativity, and innovation at every step.
              </p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                Start Your Digital Journey
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};