import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useRealtimeUpdates } from './useRealtimeUpdates';
import { ProjectsService } from '../services/projects';
import { DevelopersService } from '../services/developers';
import type { Developer, ProjectWithDetails } from '../lib/supabase';

interface SupabaseData {
  developers: Developer[];
  projects: ProjectWithDetails[];
  loading: boolean;
  error: string | null;
}

export const useSupabaseData = () => {
  const [data, setData] = useState<SupabaseData>({
    developers: [],
    projects: [],
    loading: true,
    error: null
  });

  const fetchDevelopers = useCallback(async () => {
    try {
      const result = await DevelopersService.getAllDevelopers();
      if (result.success) {
        return result.data || [];
      } else {
        throw new Error(result.message || 'Failed to fetch developers');
      }
    } catch (error) {
      console.error('Error fetching developers:', error);
      throw error;
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      // For public view, get only published projects
      const result = await ProjectsService.getPublishedProjects();
      if (result.success) {
        return result.data || [];
      } else {
        throw new Error(result.message || 'Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const [developers, projects] = await Promise.all([
        fetchDevelopers(),
        fetchProjects()
      ]);

      setData({
        developers,
        projects,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Load data error:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }));
    }
  }, [fetchDevelopers, fetchProjects]);

  // Handle real-time updates
  const handleDataChange = useCallback(() => {
    console.log('Real-time update detected, refreshing data...');
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set up realtime updates
  useRealtimeUpdates({
    onDeveloperChange: handleDataChange,
    onProjectChange: handleDataChange
  });

  return {
    ...data,
    refetch: loadData
  };
};