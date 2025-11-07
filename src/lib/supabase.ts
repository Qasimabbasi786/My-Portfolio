import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Admin {
  id: string;
  username: string;
  email: string;
  last_login?: string;
  login_attempts: number;
  locked_until?: string;
  created_at: string;
}

export interface Developer {
  id: string;
  name: string;
  email: string;
  password: string;
  github_link?: string;
  linkedin?: string;
  title?: string;
  skills: string[];
  profile_picture?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  technologies: string[];
  github_link?: string;
  live_demo_link?: string;
  featured: boolean;
  status: 'active' | 'archived' | 'draft';
  created_at: string;
  updated_at: string;
  creator_id?: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_path: string;
  image_url?: string;
  alt_text?: string;
  is_primary: boolean;
  created_at: string;
}

export interface ProjectDeveloper {
  id: string;
  project_id: string;
  developer_id: string;
  role: string;
  created_at: string;
  developer?: Developer;
}

// Enhanced project type with relationships
export interface ProjectWithDetails extends Project {
  project_images: ProjectImage[];
  project_developers: (ProjectDeveloper & { developer: Developer })[];
}