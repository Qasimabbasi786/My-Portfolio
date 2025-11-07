import { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ToastContainer, useToast } from './components/ui/Toast';
import { Header } from './components/layout/Header';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { SupabaseProjects } from './components/sections/SupabaseProjects';
import { SupabaseDevelopers } from './components/sections/SupabaseDevelopers';
import { Contact } from './components/sections/Contact';
import { ContactInfo } from './components/sections/Contact';
import { useTheme } from './hooks/useTheme';
import { useSupabaseData } from './hooks/useSupabaseData';
import { useDeveloperAuth } from './hooks/useDeveloperAuth';
import { AuthService } from './services/auth';
import { SiteSettingsService, type SiteSettings } from './services/siteSettings';
import type { Developer } from './lib/supabase';

// Lazy load ONLY conditional/modal components (not shown on initial page load)
const SupabaseAdminPanel = lazy(() => import('./components/admin/SupabaseAdminPanel').then(m => ({ default: m.SupabaseAdminPanel })));
const SupabaseDeveloperEditor = lazy(() => import('./components/admin/SupabaseDeveloperEditor').then(m => ({ default: m.SupabaseDeveloperEditor })));
const DeveloperLogin = lazy(() => import('./components/developer/DeveloperLogin').then(m => ({ default: m.DeveloperLogin })));
const DeveloperDashboard = lazy(() => import('./components/developer/DeveloperDashboard').then(m => ({ default: m.DeveloperDashboard })));
const AdminDebugPanel = lazy(() => import('./components/admin/AdminDebugPanel').then(m => ({ default: m.AdminDebugPanel })));

function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isDeveloperLoginOpen, setIsDeveloperLoginOpen] = useState(false);
  const [isDeveloperDashboardOpen, setIsDeveloperDashboardOpen] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);
  const [siteSettings, setSiteSettings] = useState<Partial<SiteSettings>>({});
  const { toasts, removeToast, addToast } = useToast();
  const { theme } = useTheme();
  const { developers, projects, loading, error, refetch } = useSupabaseData();
  const { developer: authenticatedDeveloper, isAuthenticated, logout, updateDeveloper } = useDeveloperAuth();

  // Fetch site settings from database
  useEffect(() => {
    loadSiteSettings();
  }, []);

  const loadSiteSettings = async () => {
    try {
      const result = await SiteSettingsService.getAllSettings();
      if (result.success && result.data) {
        setSiteSettings(result.data);
      }
    } catch (error) {
      console.error('Failed to load site settings:', error);
    }
  };

  const handleDeveloperLogin = async (credentials: { email: string; password: string }) => {
    try {
      const result = await AuthService.loginDeveloper(credentials.email, credentials.password);

      if (result.success) {
        addToast({ type: 'success', title: `Welcome ${result.developer?.name}!` });
        setIsDeveloperLoginOpen(false);
        setIsDeveloperDashboardOpen(true);
        window.location.reload();
        return { success: true };
      } else {
        return { success: false, error: result.message };
      }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const handleDeveloperLogout = async () => {
    await logout();
    addToast({ type: 'success', title: 'Logged out successfully' });
    setIsDeveloperDashboardOpen(false);
  };

  const handleOpenDeveloperArea = () => {
    if (isAuthenticated) {
      setIsDeveloperDashboardOpen(true);
    } else {
      setIsDeveloperLoginOpen(true);
    }
  };

  return (
    <div className={`min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 ${theme}`}>
      <Header
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenDeveloperLogin={handleOpenDeveloperArea}
        isAuthenticated={isAuthenticated}
      />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Hero siteSettings={siteSettings} />
        <About siteSettings={siteSettings} />
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600 dark:text-red-400">
            Error loading data: {error}
          </div>
        ) : (
          <>
            <SupabaseProjects 
              projects={projects}
              onRefresh={refetch}
              isEditable={false}
            />
            <SupabaseDevelopers 
              developers={developers} 
              onEditDeveloper={setEditingDeveloper}
              isEditable={false}
            />
          </>
        )}
        
        <Contact />
      </motion.main>

      <Suspense fallback={null}>
        {isAdminOpen && (
          <SupabaseAdminPanel
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
            onSettingsUpdate={loadSiteSettings}
          />
        )}

        {/* Developer Login Modal */}
        {isDeveloperLoginOpen && !isAuthenticated && (
          <DeveloperLogin
            onLoginSuccess={handleDeveloperLogin}
            onClearError={() => {}}
            onClose={() => setIsDeveloperLoginOpen(false)}
          />
        )}

        {/* Developer Dashboard */}
        {isDeveloperDashboardOpen && isAuthenticated && authenticatedDeveloper && (
          <DeveloperDashboard
            isOpen={true}
            onClose={() => setIsDeveloperDashboardOpen(false)}
            developer={authenticatedDeveloper}
            onLogout={handleDeveloperLogout}
            onDeveloperUpdate={updateDeveloper}
          />
        )}

        {/* Developer Editor Modal (Public View) */}
        {editingDeveloper && (
          <SupabaseDeveloperEditor
            developer={editingDeveloper}
            isEditable={false}
            isOpen={true}
            onClose={() => setEditingDeveloper(null)}
            onSave={() => {
              refetch();
              setEditingDeveloper(null);
            }}
          />
        )}

        {/* Debug Panel (only in development) */}
        {import.meta.env.DEV && <AdminDebugPanel />}
      </Suspense>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Logo and Contact Info */}
            <div className="flex flex-col lg:flex-row items-center justify-between mb-8">
              <div className="flex items-center mb-6 lg:mb-0">
                <img
                  src={siteSettings.logo_url || "/Globex Logo 2 Transparent (200 x 60 px) (Logo) copy.png"}
                  alt="Logo"
                  className="h-16 w-auto"
                />
              </div>
              <ContactInfo />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left">
                <div className="text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
                  <p className="mb-2">
                    © Globex Collection — A creation by Muhammad Qasim.
                  </p>
                  <p className="text-sm">
                    {siteSettings.footer_text || 'Built with React, TypeScript, and Tailwind CSS'}
                  </p>
                </div>

                {/* Quick Links */}
                <div className="flex space-x-6 text-sm">
                  <button
                    onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    About
                  </button>
                  <button
                    onClick={() => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Projects
                  </button>
                  <button
                    onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
