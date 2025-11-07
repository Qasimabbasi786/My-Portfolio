import { useState, useEffect } from 'react';
import type { AppData, Developer, Project } from '../types';

const initialData: AppData = {
  developers: [
    {
      id: '1',
      name: 'Muhammad Qasim',
      title: 'Full Stack Web Developer',
      description: 'Experienced Full Stack Web Developer specializing in modern web technologies. I build robust, scalable applications with a focus on clean code and exceptional user experiences.',
      profileImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600',
      skills: ['React', 'Node.js', 'TypeScript', 'Python', 'MongoDB', 'PostgreSQL'],
      github: 'https://github.com/Qasimabbasi786',
      linkedin: 'https://www.linkedin.com/in/muhammad-qasim-418372347/',
      email: 'qasim.tanveer81755@gmail.com'
    },
    {
      id: '2',
      name: 'Azmat Mustafa',
      title: 'Full Stack Web Developer',
      description: 'Skilled Full Stack Web Developer with expertise in creating dynamic, responsive web applications. I combine technical proficiency with creative problem-solving to deliver outstanding digital solutions.',
      profileImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=600',
      skills: ['React', 'JavaScript', 'Node.js', 'CSS', 'Tailwind CSS', 'MongoDB'],
      github: 'https://github.com/drago09t',
      linkedin: 'https://www.linkedin.com/in/azmat-mustafa-05b991264/',
      email: 'azmatmustafa979@gmail.com'
    }
  ],
  projects: [
    {
      id: '1',
      name: 'E-Commerce Platform',
      description: 'A full-featured e-commerce platform with user authentication, payment processing, and admin dashboard.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      githubUrl: 'https://github.com/Qasimabbasi786/ecommerce-platform',
      liveUrl: 'https://demo-ecommerce.com',
      image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=600',
      featured: true,
      developedBy: ['Muhammad Qasim', 'Azmat Mustafa']
    },
    {
      id: '2',
      name: 'Task Management App',
      description: 'A collaborative task management application with real-time updates and team collaboration features.',
      technologies: ['React', 'TypeScript', 'Socket.io', 'PostgreSQL'],
      githubUrl: 'https://github.com/Qasimabbasi786/task-manager',
      liveUrl: 'https://demo-taskmanager.com',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
      featured: true,
      developedBy: ['Muhammad Qasim', 'Azmat Mustafa']
    },
    {
      id: '3',
      name: 'Weather Dashboard',
      description: 'A comprehensive weather dashboard with location-based forecasts and interactive charts.',
      technologies: ['React', 'Chart.js', 'Weather API', 'Tailwind CSS'],
      githubUrl: 'https://github.com/Qasimabbasi786/weather-dashboard',
      image: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=600',
      featured: false,
      developedBy: ['Azmat Mustafa']
    }
  ],
  siteSettings: {
    title: 'Muhammad Qasim & Azmat Mustafa - Web Developers',
    description: 'Professional web development services by Muhammad Qasim and Azmat Mustafa',
    heroTitle: 'We Build Digital Experiences',
    heroSubtitle: 'Two passionate developers creating modern, scalable web solutions'
  }
};

export const useAppData = () => {
  const [data, setData] = useState<AppData>(() => {
    const savedData = localStorage.getItem('portfolioData');
    return savedData ? JSON.parse(savedData) : initialData;
  });

  useEffect(() => {
    localStorage.setItem('portfolioData', JSON.stringify(data));
  }, [data]);

  const updateDeveloper = (id: string, updates: Partial<Developer>) => {
    setData(prev => ({
      ...prev,
      developers: prev.developers.map(dev => 
        dev.id === id ? { ...dev, ...updates } : dev
      )
    }));
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === id ? { ...project, ...updates } : project
      )
    }));
  };

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject = {
      ...project,
      id: Date.now().toString()
    };
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const deleteProject = (id: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id)
    }));
  };

  const updateSiteSettings = (updates: Partial<typeof data.siteSettings>) => {
    setData(prev => ({
      ...prev,
      siteSettings: { ...prev.siteSettings, ...updates }
    }));
  };

  return {
    data,
    updateDeveloper,
    updateProject,
    addProject,
    deleteProject,
    updateSiteSettings
  };
};