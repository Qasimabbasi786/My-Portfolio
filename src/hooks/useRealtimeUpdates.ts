import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface RealtimeUpdateHandlers {
  onDeveloperChange?: () => void;
  onProjectChange?: () => void;
  onSiteSettingsChange?: () => void;
}

export const useRealtimeUpdates = (handlers: RealtimeUpdateHandlers) => {
  const { onDeveloperChange, onProjectChange, onSiteSettingsChange } = handlers;

  const handleDeveloperChange = useCallback((payload: any) => {
    console.log('Developer change detected:', payload.eventType, payload.new?.name || payload.old?.name);
    onDeveloperChange?.();
  }, [onDeveloperChange]);

  const handleProjectChange = useCallback((payload: any) => {
    console.log('Project change detected:', payload.eventType, payload.new?.title || payload.old?.title);
    onProjectChange?.();
  }, [onProjectChange]);

  const handleProjectImageChange = useCallback((payload: any) => {
    console.log('Project image change detected:', payload.eventType);
    onProjectChange?.();
  }, [onProjectChange]);

  const handleProjectDeveloperChange = useCallback((payload: any) => {
    console.log('Project developer change detected:', payload.eventType);
    onProjectChange?.();
  }, [onProjectChange]);

  const handleSiteSettingsChange = useCallback((payload: any) => {
    console.log('Site settings change detected:', payload.eventType);
    onSiteSettingsChange?.();
  }, [onSiteSettingsChange]);

  useEffect(() => {
    console.log('Setting up real-time subscriptions...');

    // Subscribe to developers table changes
    const developersSubscription = supabase
      .channel('developers_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'developers'
        },
        handleDeveloperChange
      )
      .subscribe((status) => {
        console.log('Developers subscription status:', status);
      });

    // Subscribe to projects table changes
    const projectsSubscription = supabase
      .channel('projects_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        handleProjectChange
      )
      .subscribe((status) => {
        console.log('Projects subscription status:', status);
      });

    // Subscribe to project_images table changes
    const projectImagesSubscription = supabase
      .channel('project_images_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_images'
        },
        handleProjectImageChange
      )
      .subscribe((status) => {
        console.log('Project images subscription status:', status);
      });

    // Subscribe to project_developers table changes
    const projectDevelopersSubscription = supabase
      .channel('project_developers_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_developers'
        },
        handleProjectDeveloperChange
      )
      .subscribe((status) => {
        console.log('Project developers subscription status:', status);
      });

    // Subscribe to site_settings table changes (if exists)
    const siteSettingsSubscription = supabase
      .channel('site_settings_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings'
        },
        handleSiteSettingsChange
      )
      .subscribe((status) => {
        console.log('Site settings subscription status:', status);
      });

    // Cleanup subscriptions on unmount
    return () => {
      console.log('Cleaning up real-time subscriptions...');
      developersSubscription.unsubscribe();
      projectsSubscription.unsubscribe();
      projectImagesSubscription.unsubscribe();
      projectDevelopersSubscription.unsubscribe();
      siteSettingsSubscription.unsubscribe();
    };
  }, [handleDeveloperChange, handleProjectChange, handleProjectImageChange, handleProjectDeveloperChange, handleSiteSettingsChange]);

  return {
    // Return any utility functions if needed
  };
};