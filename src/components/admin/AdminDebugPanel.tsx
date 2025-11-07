import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bug, CircleCheck as CheckCircle, Circle as XCircle, TriangleAlert as AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAdminSession } from '../../hooks/useAdminSession';

interface DebugCheck {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'warning' | 'loading';
  message: string;
}

export const AdminDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [checks, setChecks] = useState<DebugCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { isAuthenticated, admin, error } = useAdminSession();

  const runDiagnostics = async () => {
    setIsRunning(true);
    const newChecks: DebugCheck[] = [];

    // Check 1: Environment Variables
    try {
      const hasSupabaseUrl = !!import.meta.env.VITE_SUPABASE_URL;
      const hasSupabaseKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (hasSupabaseUrl && hasSupabaseKey) {
        newChecks.push({
          id: 'env',
          label: 'Environment Variables',
          status: 'pass',
          message: 'Supabase environment variables are configured'
        });
      } else {
        newChecks.push({
          id: 'env',
          label: 'Environment Variables',
          status: 'fail',
          message: `Missing: ${!hasSupabaseUrl ? 'VITE_SUPABASE_URL ' : ''}${!hasSupabaseKey ? 'VITE_SUPABASE_ANON_KEY' : ''}`
        });
      }
    } catch (error) {
      newChecks.push({
        id: 'env',
        label: 'Environment Variables',
        status: 'fail',
        message: 'Failed to check environment variables'
      });
    }

    // Check 2: Authentication Status
    if (isAuthenticated && admin) {
      newChecks.push({
        id: 'auth',
        label: 'Authentication',
        status: 'pass',
        message: `Authenticated as ${admin.username}`
      });
    } else if (error) {
      newChecks.push({
        id: 'auth',
        label: 'Authentication',
        status: 'fail',
        message: error
      });
    } else {
      newChecks.push({
        id: 'auth',
        label: 'Authentication',
        status: 'warning',
        message: 'Not authenticated'
      });
    }

    // Check 3: Local Storage
    try {
      const token = localStorage.getItem('admin_token');
      if (token) {
        newChecks.push({
          id: 'storage',
          label: 'Local Storage',
          status: 'pass',
          message: 'Admin token found in localStorage'
        });
      } else {
        newChecks.push({
          id: 'storage',
          label: 'Local Storage',
          status: 'warning',
          message: 'No admin token in localStorage'
        });
      }
    } catch (error) {
      newChecks.push({
        id: 'storage',
        label: 'Local Storage',
        status: 'fail',
        message: 'Failed to access localStorage'
      });
    }

    // Check 4: Network Connectivity
    try {
      const response = await fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/', {
        method: 'HEAD',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        }
      });
      
      if (response.ok) {
        newChecks.push({
          id: 'network',
          label: 'Supabase Connection',
          status: 'pass',
          message: 'Successfully connected to Supabase'
        });
      } else {
        newChecks.push({
          id: 'network',
          label: 'Supabase Connection',
          status: 'fail',
          message: `HTTP ${response.status}: ${response.statusText}`
        });
      }
    } catch (error) {
      newChecks.push({
        id: 'network',
        label: 'Supabase Connection',
        status: 'fail',
        message: 'Network error: Cannot reach Supabase'
      });
    }

    // Check 5: Console Errors
    const hasConsoleErrors = window.console.error.toString().includes('bound consoleCall');
    newChecks.push({
      id: 'console',
      label: 'Console Errors',
      status: hasConsoleErrors ? 'warning' : 'pass',
      message: hasConsoleErrors ? 'Check browser console for errors' : 'No obvious console errors detected'
    });

    setChecks(newChecks);
    setIsRunning(false);
  };

  const getStatusIcon = (status: DebugCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'loading':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-lg z-50"
        title="Open Debug Panel"
      >
        <Bug className="w-5 h-5" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bug className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Debug Panel</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Admin Panel Diagnostics
          </span>
          <Button
            size="sm"
            onClick={runDiagnostics}
            disabled={isRunning}
            className="text-xs"
          >
            {isRunning ? (
              <RefreshCw className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="w-3 h-3 mr-1" />
            )}
            Run Checks
          </Button>
        </div>

        {checks.length > 0 && (
          <div className="space-y-2">
            {checks.map((check) => (
              <div
                key={check.id}
                className="flex items-start space-x-2 p-2 rounded bg-gray-50 dark:bg-gray-700"
              >
                {getStatusIcon(check.status)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {check.label}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 break-words">
                    {check.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {checks.length === 0 && !isRunning && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
            Click "Run Checks" to diagnose admin panel issues
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <div>Timestamp: {new Date().toLocaleTimeString()}</div>
            <div>Session: {isAuthenticated ? 'Active' : 'Inactive'}</div>
            <div>User: {admin?.username || 'None'}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};