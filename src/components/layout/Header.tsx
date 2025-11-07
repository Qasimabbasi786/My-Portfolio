import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, LogIn } from '../../utils/icons';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';

interface HeaderProps {
  onOpenAdmin: () => void;
  onOpenDeveloperLogin: () => void;
  isAuthenticated?: boolean;
}

const navItems = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#developers', label: 'Developers' },
  { href: '#contact', label: 'Contact' }
];

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, onOpenDeveloperLogin, isAuthenticated = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleSectionChange = () => {
      const sections = navItems.map(item => item.href.substring(1));
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleSectionChange);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleSectionChange);
    };
  }, []);

  const scrollToHome = () => {
    document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl shadow-purple-500/10' 
          : 'bg-transparent'
      }`}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo with enhanced animation */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center cursor-pointer group"
            onClick={scrollToHome}
          >
            <div className="relative">
              <img
                src="/Globex Logo 2 Transparent (200 x 60 px) (Logo) copy.png"
                alt="Globex Logo"
                className="h-12 w-auto transition-all duration-300 group-hover:brightness-110"
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>

          {/* Desktop Navigation with enhanced styling */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <motion.button
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                onClick={() => scrollToSection(item.href)}
                className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  activeSection === item.href.substring(1)
                    ? 'text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {item.label}
                {activeSection === item.href.substring(1) && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {/* Login/Dashboard button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenDeveloperLogin}
                className={`hidden sm:inline-flex ${
                  isAuthenticated
                    ? 'bg-gradient-to-r from-green-800 to-emerald-800 hover:from-green-700 hover:to-emerald-700 border-green-600 hover:border-green-500/50 shadow-lg hover:shadow-green-500/25'
                    : 'bg-gradient-to-r from-cyan-800 to-blue-800 hover:from-cyan-700 hover:to-blue-700 border-cyan-600 hover:border-cyan-500/50 shadow-lg hover:shadow-cyan-500/25'
                } text-slate-200 border transition-all duration-300`}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {isAuthenticated ? 'Dashboard' : 'Login'}
              </Button>
            </motion.div>

            {/* Admin button with glow effect */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenAdmin}
                className="hidden sm:inline-flex bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-slate-200 border border-slate-600 hover:border-slate-500/50 shadow-lg hover:shadow-slate-500/25 transition-all duration-300"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </motion.div>

            {/* Enhanced mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300"
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-slate-200" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-200" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden mt-6 py-6 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-xl rounded-2xl"
            >
              <div className="flex flex-col space-y-3">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 10, scale: 1.02 }}
                    onClick={() => scrollToSection(item.href)}
                    className={`text-left px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      activeSection === item.href.substring(1)
                        ? 'text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    {item.label}
                  </motion.button>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="pt-4 border-t border-slate-700/50 space-y-3"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onOpenDeveloperLogin();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full ${
                      isAuthenticated
                        ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/50 hover:from-green-600/30 hover:to-emerald-600/30'
                        : 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-cyan-500/50 hover:from-cyan-600/30 hover:to-blue-600/30'
                    } text-white`}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {isAuthenticated ? 'Developer Dashboard' : 'Developer Login'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onOpenAdmin();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-slate-600/20 to-slate-500/20 border-slate-500/50 text-white hover:from-slate-600/30 hover:to-slate-500/30"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>
                </motion.div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};