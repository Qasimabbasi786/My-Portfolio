/*
  # Create site_settings table for admin panel

  1. New Tables
    - `site_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Setting key/name
      - `value` (jsonb) - Setting value stored as JSON
      - `category` (text) - Category for grouping settings
      - `description` (text) - Human readable description
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `site_settings` table
    - Add policy for public read access
    - Add policy for admin write access

  3. Default Data
    - Insert default site settings with current website data
*/

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  category text DEFAULT 'general',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read site settings"
  ON site_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin manage site settings"
  ON site_settings
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_updated_at();

-- Insert default settings
INSERT INTO site_settings (key, value, category, description) VALUES
  ('site_title', '"Muhammad Qasim & Azmat Mustafa - Web Developers"', 'general', 'Main site title'),
  ('site_description', '"Professional web development services by Muhammad Qasim and Azmat Mustafa"', 'general', 'Site meta description'),
  ('hero_title', '"Hi, We are Muhammad Qasim & Azmat Mustafa"', 'content', 'Hero section main title'),
  ('hero_subtitle', '"Crafting exceptional digital experiences with cutting-edge technology and innovative design solutions for clients worldwide."', 'content', 'Hero section subtitle'),
  ('contact_email', '"qasim.tanveer81755@gmail.com"', 'contact', 'Primary contact email'),
  ('contact_phone', '"+92 3440052943"', 'contact', 'Primary contact phone'),
  ('contact_address', '"Available Worldwide"', 'contact', 'Business address or location'),
  ('logo_url', '"/Globex Logo 2 Transparent (200 x 60 px) (Logo) copy.png"', 'branding', 'Site logo URL'),
  ('theme_primary_color', '"#3B82F6"', 'theme', 'Primary brand color'),
  ('theme_secondary_color', '"#8B5CF6"', 'theme', 'Secondary brand color'),
  ('default_theme', '"dark"', 'theme', 'Default theme preference'),
  ('github_link', '"https://github.com/Qasimabbasi786"', 'social', 'GitHub profile URL'),
  ('linkedin_link', '"https://www.linkedin.com/in/muhammad-qasim-418372347/"', 'social', 'LinkedIn profile URL'),
  ('facebook_link', '""', 'social', 'Facebook page URL'),
  ('instagram_link', '""', 'social', 'Instagram profile URL'),
  ('twitter_link', '""', 'social', 'Twitter profile URL'),
  ('youtube_link', '""', 'social', 'YouTube channel URL'),
  ('tagline', '"We Build Digital Experiences"', 'branding', 'Site tagline or slogan'),
  ('about_text', '"Two passionate developers creating modern, scalable web solutions"', 'content', 'About section text'),
  ('footer_text', '"Built with React, TypeScript, and Tailwind CSS"', 'content', 'Footer copyright text')
ON CONFLICT (key) DO NOTHING;