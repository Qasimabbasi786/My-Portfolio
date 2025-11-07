import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Activity, Filter, Search, RefreshCw, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AuditLogger } from '../../services/auditLogger';

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  admin?: {
    username: string;
    email: string;
  };
}

interface AuditLogViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  isOpen,
  onClose
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    if (isOpen) {
      loadLogs(true);
    }
  }, [isOpen]);

  const loadLogs = async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 0 : page;
      const result = await AuditLogger.getAuditLogs(ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
      
      if (result.success) {
        const newLogs = result.data || [];
        setLogs(reset ? newLogs : [...logs, ...newLogs]);
        setHasMore(newLogs.length === ITEMS_PER_PAGE);
        setPage(reset ? 1 : page + 1);
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = !actionFilter || log.action.includes(actionFilter);
    
    return matchesSearch && matchesAction;
  });

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'text-green-600 dark:text-green-400';
    if (action.includes('UPDATE')) return 'text-blue-600 dark:text-blue-400';
    if (action.includes('DELETE')) return 'text-red-600 dark:text-red-400';
    if (action.includes('UPLOAD')) return 'text-purple-600 dark:text-purple-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getActionIcon = (action: string) => {
    return <Activity className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const uniqueActions = [...new Set(logs.map(log => log.action.split('_')[0]))];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Audit Log" maxWidth="2xl">
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => loadLogs(true)}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Logs List */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
            {loading && logs.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No audit logs found
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`mt-1 ${getActionColor(log.action)}`}>
                          {getActionIcon(log.action)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${getActionColor(log.action)}`}>
                              {log.action.replace(/_/g, ' ')}
                            </span>
                            {log.table_name && (
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {log.table_name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{log.admin?.username || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(log.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Load More */}
          {hasMore && !loading && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => loadLogs(false)}
                disabled={loading}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Log Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title="Audit Log Details"
          maxWidth="xl"
        >
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Action
                </label>
                <p className={`font-medium ${getActionColor(selectedLog.action)}`}>
                  {selectedLog.action.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Admin
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedLog.admin?.username || 'Unknown'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date & Time
                </label>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(selectedLog.created_at)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  IP Address
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedLog.ip_address || 'Unknown'}
                </p>
              </div>
            </div>

            {/* Table and Record Info */}
            {(selectedLog.table_name || selectedLog.record_id) && (
              <div className="grid grid-cols-2 gap-4">
                {selectedLog.table_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Table
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedLog.table_name}
                    </p>
                  </div>
                )}
                {selectedLog.record_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Record ID
                    </label>
                    <p className="text-gray-900 dark:text-white font-mono text-sm">
                      {selectedLog.record_id}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Old Values */}
            {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Previous Values
                </label>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <pre className="text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* New Values */}
            {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Values
                </label>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <pre className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* User Agent */}
            {selectedLog.user_agent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User Agent
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                  {selectedLog.user_agent}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};