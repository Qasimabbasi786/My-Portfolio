export interface Developer {
  id: string;
  name: string;
  title: string;
  description: string;
  profileImage: string;
  skills: string[];
  github: string;
  linkedin: string;
  email: string;
  bio?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl?: string;
  image: string;
  featured: boolean;
  developedBy: string[];
}

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export type Theme = 'light' | 'dark';

export interface AppData {
  developers: Developer[];
  projects: Project[];
  siteSettings: {
    title: string;
    description: string;
    heroTitle: string;
    heroSubtitle: string;
  };
}