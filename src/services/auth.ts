import { supabase } from '../lib/supabase';
import type { Admin } from '../lib/supabase';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  admin?: Omit<Admin, 'password'>;
}

export interface DeveloperAuthResponse {
  success: boolean;
  message: string;
  token?: string;
  developer?: {
    id: string;
    email: string;
    name: string;
    title: string;
  };
}

export class AuthService {
  // Login admin using Supabase RPC function
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { email, password } = credentials;

      // Input validation
      if (!email || !password) {
        return {
          success: false,
          message: 'Email and password are required'
        };
      }

      // Call Supabase RPC function to authenticate admin by email
      const { data, error } = await supabase.rpc('authenticate_admin_by_email', {
        email_input: email.toLowerCase().trim(),
        password_input: password
      });

      if (error) {
        console.error('Authentication error:', error);
        return {
          success: false,
          message: 'Authentication failed'
        };
      }

      if (!data || data.length === 0 || !data[0].authenticated) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      const admin = data[0];

      // Generate a simple token (in production, use proper JWT)
      const token = btoa(JSON.stringify({
        id: admin.id,
        email: admin.email,
        timestamp: Date.now()
      }));

      return {
        success: true,
        message: 'Login successful',
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          created_at: new Date().toISOString(),
          login_attempts: 0,
          last_login: null,
          locked_until: null
        }
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login'
      };
    }
  }

  // Verify admin token
  static async verifyAdmin(token: string): Promise<{ success: boolean; admin?: Omit<Admin, 'password'> }> {
    try {
      const decoded = JSON.parse(atob(token));
      
      // Check if token is not too old (24 hours)
      if (Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
        return { success: false };
      }

      // Verify admin still exists
      const { data: admin, error } = await supabase
        .from('admins')
        .select('id, username, email, created_at')
        .eq('id', decoded.id)
        .maybeSingle();

      if (error || !admin) {
        return { success: false };
      }

      return { 
        success: true, 
        admin: {
          ...admin,
          login_attempts: 0,
          last_login: null,
          locked_until: null
        }
      };
    } catch (error) {
      return { success: false };
    }
  }

  // Create admin (for initial setup)
  static async createAdmin(adminData: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      const { username, email, password } = adminData;

      // Validate input
      if (!username || !email || !password) {
        return {
          success: false,
          message: 'All fields are required'
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          message: 'Password must be at least 6 characters long'
        };
      }

      // Check if admin already exists
      const { data: existingAdmin } = await supabase
        .from('admins')
        .select('id')
        .or(`username.eq.${username},email.eq.${email}`)
        .single();

      if (existingAdmin) {
        return {
          success: false,
          message: 'Admin with this username or email already exists'
        };
      }

      // Use Supabase RPC to create admin with hashed password
      const { data, error } = await supabase.rpc('create_admin', {
        username_input: username.toLowerCase().trim(),
        email_input: email.toLowerCase().trim(),
        password_input: password
      });

      if (error) {
        return {
          success: false,
          message: 'Failed to create admin account'
        };
      }

      return {
        success: true,
        message: 'Admin account created successfully'
      };

    } catch (error) {
      console.error('Create admin error:', error);
      return {
        success: false,
        message: 'An error occurred while creating admin account'
      };
    }
  }

  // Developer login using direct database query with plain-text password
  static async loginDeveloper(email: string, password: string): Promise<DeveloperAuthResponse> {
    try {
      if (!email || !password) {
        return {
          success: false,
          message: 'Email and password are required'
        };
      }

      const normalizedEmail = email.toLowerCase().trim();

      const { data: developer, error } = await supabase
        .from('developers')
        .select('id, email, name, title, profile_picture, bio, skills, github_link, linkedin, password')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (error || !developer) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      if (developer.password !== password) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      const token = btoa(JSON.stringify({
        id: developer.id,
        email: developer.email,
        timestamp: Date.now()
      }));

      const developerData = {
        id: developer.id,
        email: developer.email,
        name: developer.name,
        title: developer.title,
        profile_picture: developer.profile_picture,
        bio: developer.bio,
        skills: developer.skills,
        github_link: developer.github_link,
        linkedin: developer.linkedin
      };

      localStorage.setItem('developer_token', token);
      localStorage.setItem('developer_data', JSON.stringify(developerData));

      return {
        success: true,
        message: 'Login successful',
        token,
        developer: developerData
      };

    } catch (error) {
      console.error('Developer login error:', error);
      return {
        success: false,
        message: 'An error occurred during login'
      };
    }
  }

  // Verify developer session
  static async verifyDeveloper(): Promise<{ success: boolean; developer?: any }> {
    try {
      const token = localStorage.getItem('developer_token');
      if (!token) {
        return { success: false };
      }

      const decoded = JSON.parse(atob(token));

      if (Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('developer_token');
        localStorage.removeItem('developer_data');
        return { success: false };
      }

      const { data: developerData, error } = await supabase
        .from('developers')
        .select('id, email, name, title, profile_picture, bio, skills, github_link, linkedin')
        .eq('id', decoded.id)
        .maybeSingle();

      if (error || !developerData) {
        localStorage.removeItem('developer_token');
        localStorage.removeItem('developer_data');
        return { success: false };
      }

      return {
        success: true,
        developer: developerData
      };
    } catch (error) {
      localStorage.removeItem('developer_token');
      localStorage.removeItem('developer_data');
      return { success: false };
    }
  }

  // Logout developer
  static async logoutDeveloper(): Promise<void> {
    localStorage.removeItem('developer_token');
    localStorage.removeItem('developer_data');
  }

  // Get current session
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        return null;
      }
      return session;
    } catch (error) {
      return null;
    }
  }
}