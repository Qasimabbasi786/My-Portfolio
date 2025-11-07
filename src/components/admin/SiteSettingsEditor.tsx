import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Palette, Globe, Mail, Phone, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { ImageUpload } from '../ui/ImageUpload';
import { SiteSettingsService, type SiteSettings } from '../../services/siteSettings';
import { useToast } from '../ui/Toast';

interface SiteSettingsEditorProps {
  onSettingsUpdate?: () => void;
}

export const SiteSettingsEditor: React.FC<SiteSettingsEditorProps> = ({
  onSettingsUpdate
}) => {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const result = await SiteSettingsService.getAllSettings();
      if (result.success && result.data) {
        setSettings(result.data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: keyof SiteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await SiteSettingsService.updateSettings(settings);
      if (result.success) {
        addToast({
          type: 'success',
          title: 'Settings Updated',
          message: result.message || 'Site settings have been updated successfully'
        });
        await loadSettings();
        onSettingsUpdate?.();
      } else {
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: result.message || 'Failed to save settings'
        });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'An unexpected error occurred while saving settings'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all settings to defaults? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    try {
      const result = await SiteSettingsService.resetToDefaults();
      if (result.success) {
        addToast({
          type: 'success',
          title: 'Settings Reset',
          message: result.message || 'Settings have been reset to defaults successfully'
        });
        await loadSettings();
        onSettingsUpdate?.();
      } else {
        addToast({
          type: 'error',
          title: 'Reset Failed',
          message: result.message || 'Failed to reset settings'
        });
      }
    } catch (error) {
      console.error('Failed to reset settings:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'An unexpected error occurred while resetting settings'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpdate = async (logoUrl: string) => {
    handleInputChange('logo_url', logoUrl);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Site Settings
        </h3>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              General Information
            </h4>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Site Title
            </label>
            <input
              type="text"
              value={settings.site_title || ''}
              onChange={(e) => handleInputChange('site_title', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter site title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Site Description
            </label>
            <textarea
              value={settings.site_description || ''}
              onChange={(e) => handleInputChange('site_description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter site description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hero Title
            </label>
            <input
              type="text"
              value={settings.hero_title || ''}
              onChange={(e) => handleInputChange('hero_title', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter hero section title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hero Subtitle
            </label>
            <textarea
              value={settings.hero_subtitle || ''}
              onChange={(e) => handleInputChange('hero_subtitle', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter hero section subtitle"
            />
          </div>
        </div>

        {/* Contact & Branding */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <Mail className="w-5 h-5 text-purple-600" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Contact & Branding
            </h4>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={settings.contact_email || ''}
              onChange={(e) => handleInputChange('contact_email', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter contact email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              value={settings.contact_phone || ''}
              onChange={(e) => handleInputChange('contact_phone', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter contact phone"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address/Location
            </label>
            <input
              type="text"
              value={settings.contact_address || ''}
              onChange={(e) => handleInputChange('contact_address', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter business address or location"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Site Logo
            </label>
            <div className="flex items-center space-x-4">
              {settings.logo_url && (
                <img
                  src={settings.logo_url}
                  alt="Current logo"
                  className="h-12 w-auto object-contain bg-white rounded border"
                />
              )}
              <ImageUpload
                currentImage={settings.logo_url}
                onImageUpdate={handleLogoUpdate}
                uploadType="project"
                cropShape="rect"
                aspectRatio={3.33} // 200x60 ratio
                className="w-24 h-16"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Social Media Links
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GitHub
                </label>
                <input
                  type="url"
                  value={settings.github_link || ''}
                  onChange={(e) => handleInputChange('github_link', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://github.com/username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={settings.linkedin_link || ''}
                  onChange={(e) => handleInputChange('linkedin_link', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Facebook
                </label>
                <input
                  type="url"
                  value={settings.facebook_link || ''}
                  onChange={(e) => handleInputChange('facebook_link', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://facebook.com/page"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  value={settings.instagram_link || ''}
                  onChange={(e) => handleInputChange('instagram_link', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://instagram.com/username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  value={settings.twitter_link || ''}
                  onChange={(e) => handleInputChange('twitter_link', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://twitter.com/username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  YouTube
                </label>
                <input
                  type="url"
                  value={settings.youtube_link || ''}
                  onChange={(e) => handleInputChange('youtube_link', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://youtube.com/channel/..."
                />
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="flex items-center space-x-2 mb-4">
            <Palette className="w-5 h-5 text-green-600" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Theme Settings
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={settings.theme_primary_color || '#3B82F6'}
                  onChange={(e) => handleInputChange('theme_primary_color', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={settings.theme_primary_color || '#3B82F6'}
                  onChange={(e) => handleInputChange('theme_primary_color', e.target.value)}
                  className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={settings.theme_secondary_color || '#8B5CF6'}
                  onChange={(e) => handleInputChange('theme_secondary_color', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={settings.theme_secondary_color || '#8B5CF6'}
                  onChange={(e) => handleInputChange('theme_secondary_color', e.target.value)}
                  className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Theme
            </label>
            <select
              value={settings.default_theme || 'dark'}
              onChange={(e) => handleInputChange('default_theme', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Additional Content Settings */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Additional Content
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={settings.tagline || ''}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter site tagline"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                About Text
              </label>
              <textarea
                value={settings.about_text || ''}
                onChange={(e) => handleInputChange('about_text', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter about section text"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Footer Text
              </label>
              <input
                type="text"
                value={settings.footer_text || ''}
                onChange={(e) => handleInputChange('footer_text', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter footer text"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Preview
        </h4>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="text-center">
            {settings.logo_url && (
              <img
                src={settings.logo_url}
                alt="Logo preview"
                className="h-16 w-auto mx-auto mb-4"
              />
            )}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {settings.hero_title || 'Hero Title'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {settings.hero_subtitle || 'Hero subtitle'}
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{settings.contact_email || 'email@example.com'}</span>
              <span>•</span>
              <span>{settings.contact_phone || '+1 234 567 8900'}</span>
              {settings.contact_address && (
                <>
                  <span>•</span>
                  <span>{settings.contact_address}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};