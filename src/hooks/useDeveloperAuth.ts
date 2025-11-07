import { useState, useEffect } from 'react';
import { AuthService } from '../services/auth';
import type { Developer } from '../lib/supabase';

export const useDeveloperAuth = () => {
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const result = await AuthService.verifyDeveloper();
      if (result.success && result.developer) {
        setDeveloper(result.developer);
        setIsAuthenticated(true);
      } else {
        setDeveloper(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setDeveloper(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AuthService.logoutDeveloper();
    setDeveloper(null);
    setIsAuthenticated(false);
  };

  const updateDeveloper = (updatedDeveloper: Developer) => {
    setDeveloper(updatedDeveloper);
  };

  return {
    developer,
    isAuthenticated,
    isLoading,
    checkAuth,
    logout,
    updateDeveloper
  };
};
