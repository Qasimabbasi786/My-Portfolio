import { supabase } from '../lib/supabase';
import { AuditLogger } from './auditLogger';

export interface SiteSettings {
  site_title: string;
  site_description: string;
  hero_title: string;
  hero_subtitle: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  logo_url: string;
  theme_primary_color: string;
  theme_secondary_color: string;
  default_theme: 'light' | 'dark';
  github_link: string;
  linkedin_link: string;
  facebook_link: string;
  instagram_link: string;
  twitter_link: string;
  youtube_link: string;
  tagline: string;
  about_text: string;
  footer_text: string;
}

export class SiteSettingsService {
  // Initialize site settings table if it doesn't exist
  static async initializeSiteSettings(): Promise<{ success: boolean; message?: string }> {
    try {
      // Check if table exists by trying to select from it
      const { error: checkError } = await supabase
        .from('site_settings')
        .select('key')
        .limit(1);

      if (checkError && checkError.code === 'PGRST116') {
        // Table doesn't exist, but we can't create it from client
        return {
          success: false,
          message: 'Site settings table does not exist. Please run the migration file.'
        };
      }

      // Table exists, check if we have default data
      const { data: existingSettings, error: dataError } = await supabase
        .from('site_settings')
        .select('key')
        .limit(1);

      if (dataError) {
        return {
          success: false,
          message: 'Failed to check existing settings'
        };
      }

      // If no settings exist, insert defaults
      if (!existingSettings || existingSettings.length === 0) {
        const defaultSettings = [
          { key: 'site_title', value: JSON.stringify('Muhammad Qasim & Azmat Mustafa - Full-Stack Digital Innovators'), category: 'general' },
          { key: 'site_description', value: JSON.stringify('Professional Full-Stack Digital Innovation services by Muhammad Qasim and Azmat Mustafa'), category: 'general' },
          { key: 'hero_title', value: JSON.stringify('Hi, We are Muhammad Qasim & Azmat Mustafa'), category: 'content' },
          { key: 'hero_subtitle', value: JSON.stringify('Crafting powerful Websites, Apps, AI, Digital Marketing (Meta Ads etc), and Cybersecurity solutions for clients worldwide.'), category: 'content' },
          { key: 'contact_email', value: JSON.stringify('qasim.abbasi81755@gmail.com'), category: 'contact' },
          { key: 'contact_phone', value: JSON.stringify('+92 3440052943'), category: 'contact' },
          { key: 'contact_address', value: JSON.stringify('Available Worldwide'), category: 'contact' },
          { key: 'logo_url', value: JSON.stringify('/Globex Logo 2 Transparent (200 x 60 px) (Logo) copy.png'), category: 'branding' },
          { key: 'theme_primary_color', value: JSON.stringify('#3B82F6'), category: 'theme' },
          { key: 'theme_secondary_color', value: JSON.stringify('#8B5CF6'), category: 'theme' },
          { key: 'default_theme', value: JSON.stringify('dark'), category: 'theme' },
          { key: 'github_link', value: JSON.stringify('https://github.com/Qasimabbasi786'), category: 'social' },
          { key: 'linkedin_link', value: JSON.stringify('https://www.linkedin.com/in/muhammad-qasim-418372347/'), category: 'social' },
          { key: 'facebook_link', value: JSON.stringify('https://www.facebook.com/qasim.abbasi.176319'), category: 'social' },
          { key: 'instagram_link', value: JSON.stringify('https://www.instagram.com/qasim_abbasi786/'), category: 'social' },
          { key: 'twitter_link', value: JSON.stringify(''), category: 'social' },
          { key: 'youtube_link', value: JSON.stringify(''), category: 'social' },
          { key: 'tagline', value: JSON.stringify('We Build Digital Experiences'), category: 'branding' },
          { key: 'about_text', value: JSON.stringify('A creative team building smart, scalable digital solutions — from web & apps to AI and marketing.'), category: 'content' },
          { key: 'footer_text', value: JSON.stringify('Committed to quality, innovation, and long-term client success.'), category: 'content' }
        ];

        const { error: insertError } = await supabase
          .from('site_settings')
          .insert(defaultSettings);

        if (insertError) {
          return {
            success: false,
            message: 'Failed to insert default settings'
          };
        }
      }

      return {
        success: true,
        message: 'Site settings initialized successfully'
      };
    } catch (error) {
      console.error('Initialize site settings error:', error);
      return {
        success: false,
        message: 'An error occurred while initializing site settings'
      };
    }
  }

  // Get all site settings
  static async getAllSettings(): Promise<{ success: boolean; data?: SiteSettings; message?: string }> {
    try {
      // Try to initialize settings first
      await this.initializeSiteSettings();

      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');

      if (error) {
        console.error('Get settings error:', error);
        return {
          success: false,
          message: `Failed to fetch site settings: ${error.message}`
        };
      }

      // Transform array of key-value pairs to object
      const settings: any = {};
      data?.forEach(setting => {
        try {
          settings[setting.key] = JSON.parse(setting.value);
        } catch (parseError) {
          // If JSON parse fails, use the raw value
          settings[setting.key] = setting.value;
        }
      });

      return {
        success: true,
        data: settings
      };
    } catch (error) {
      console.error('Get site settings error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching site settings'
      };
    }
  }

  // Update a single setting
  static async updateSetting(key: string, value: any): Promise<{ success: boolean; message?: string }> {
    try {
      // Get old value for audit log
      const { data: oldData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', key)
        .single();

      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key,
          value: JSON.stringify(value)
        });

      if (error) {
        return {
          success: false,
          message: 'Failed to update setting'
        };
      }

      // Log the change
      await AuditLogger.logUpdate(
        'site_settings',
        key,
        { [key]: oldData?.value ? JSON.parse(oldData.value) : null },
        { [key]: value }
      );

      return {
        success: true,
        message: 'Setting updated successfully'
      };
    } catch (error) {
      console.error('Update setting error:', error);
      return {
        success: false,
        message: 'An error occurred while updating setting'
      };
    }
  }

  // Update multiple settings
  static async updateSettings(settings: Partial<SiteSettings>): Promise<{ success: boolean; message?: string }> {
    try {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        return {
          success: false,
          message: 'Admin authentication required'
        };
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-site-settings?action=update`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Failed to update settings'
        };
      }

      return {
        success: true,
        message: result.message || 'Settings updated successfully'
      };
    } catch (error) {
      console.error('Update settings error:', error);
      return {
        success: false,
        message: 'An error occurred while updating settings'
      };
    }
  }

  // Get a single setting
  static async getSetting(key: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error) {
        return {
          success: false,
          message: 'Setting not found'
        };
      }

      return {
        success: true,
        data: typeof data.value === 'string' ? JSON.parse(data.value) : data.value
      };
    } catch (error) {
      console.error('Get setting error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching setting'
      };
    }
  }

  // Reset settings to defaults
  static async resetToDefaults(): Promise<{ success: boolean; message?: string }> {
    try {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        return {
          success: false,
          message: 'Admin authentication required'
        };
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-site-settings?action=reset`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Failed to reset settings'
        };
      }

      return {
        success: true,
        message: result.message || 'Settings reset to defaults successfully'
      };
    } catch (error) {
      console.error('Reset settings error:', error);
      return {
        success: false,
        message: 'An error occurred while resetting settings'
      };
    }
  }
}