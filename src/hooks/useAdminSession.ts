import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/auth';
import { AuditLogger } from '../services/auditLogger';
import type { Admin } from '../lib/supabase';

interface AdminSessionState {
  isAuthenticated: boolean;
  admin: Admin | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export const useAdminSession = () => {
  const [sessionState, setSessionState] = useState<AdminSessionState>({
    isAuthenticated: false,
    admin: null,
    isLoading: true,
    error: null,
    isInitialized: false
  });

  const checkSession = useCallback(async () => {
    try {
      setSessionState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setSessionState({
          isAuthenticated: false,
          admin: null,
          isLoading: false,
          error: null,
          isInitialized: true
        });
        return;
      }

      const result = await AuthService.verifyAdmin(token);
      if (result.success && result.admin) {
        AuditLogger.setAdminId(result.admin.id);
        setSessionState({
          isAuthenticated: true,
          admin: result.admin,
          isLoading: false,
          error: null,
          isInitialized: true
        });
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('admin_token');
        AuditLogger.clearAdminId();
        setSessionState({
          isAuthenticated: false,
          admin: null,
          isLoading: false,
          error: 'Session expired. Please log in again.',
          isInitialized: true
        });
      }
    } catch (error) {
      console.error('Session check error:', error);
      setSessionState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to verify session. Please try again.',
        isInitialized: true
      }));
    }
  }, []);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    try {
      setSessionState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await AuthService.login(credentials);
      if (result.success && result.token && result.admin) {
        localStorage.setItem('admin_token', result.token);
        AuditLogger.setAdminId(result.admin.id);
        setSessionState({
          isAuthenticated: true,
          admin: result.admin,
          isLoading: false,
          error: null,
          isInitialized: true
        });
        return { success: true };
      } else {
        setSessionState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message || 'Login failed'
        }));
        return { success: false, error: result.message };
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during login';
      setSessionState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    AuditLogger.clearAdminId();
    setSessionState({
      isAuthenticated: false,
      admin: null,
      isLoading: false,
      error: null,
      isInitialized: true
    });
  }, []);

  const clearError = useCallback(() => {
    setSessionState(prev => ({ ...prev, error: null }));
  }, []);

  const retry = useCallback(() => {
    checkSession();
  }, [checkSession]);

  // Initialize session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Periodic session validation (every 30 minutes)
  useEffect(() => {
    if (!sessionState.isAuthenticated) return;

    const interval = setInterval(() => {
      checkSession();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [sessionState.isAuthenticated, checkSession]);

  return {
    ...sessionState,
    login,
    logout,
    retry,
    clearError,
    checkSession
  };
};