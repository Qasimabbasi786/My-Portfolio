import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, 
  Image as ImageIcon, 
  Video, 
  Trash2, 
  Copy, 
  Download, 
  Eye,
  Search,
  Filter,
  Grid,
  List,
  RefreshCw
} from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';
import { StorageService } from '../../services/storage';
import { AuditLogger } from '../../services/auditLogger';

interface FileItem {
  name: string;
  path: string;
  size: number;
  type: 'image' | 'video' | 'other';
  url: string;
  lastModified: Date;
}

interface FileManagerProps {
  isOpen: boolean;
  onClose: () => void;
  bucket?: string;
  onFileSelect?: (file: FileItem) => void;
}

export const FileManager: React.FC<FileManagerProps> = ({
  isOpen,
  onClose,
  bucket = 'projects',
  onFileSelect
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen, bucket]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const result = await StorageService.listFiles(bucket);
      if (result.success && result.files) {
        setFiles(result.files);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFiles = async () => {
    if (selectedFiles.size === 0) return;
    
    if (!window.confirm(`Delete ${selectedFiles.size} file(s)? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const deletePromises = Array.from(selectedFiles).map(async (filePath) => {
        const file = files.find(f => f.path === filePath);
        if (file) {
          await StorageService.deleteFile(bucket, filePath);
          await AuditLogger.logFileDelete(file.name, filePath);
        }
      });

      await Promise.all(deletePromises);
      setSelectedFiles(new Set());
      await loadFiles();
    } catch (error) {
      console.error('Failed to delete files:', error);
      alert('Failed to delete some files');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async (file: FileItem) => {
    try {
      await navigator.clipboard.writeText(file.url);
      // You could add a toast notification here
      console.log('URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleDownload = (file: FileItem) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFileSelection = (filePath: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(filePath)) {
      newSelection.delete(filePath);
    } else {
      newSelection.add(filePath);
    }
    setSelectedFiles(newSelection);
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: FileItem) => {
    switch (file.type) {
      case 'image':
        return <ImageIcon className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      default:
        return <Folder className="w-5 h-5" />;
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="File Manager" maxWidth="2xl">
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Files</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Actions */}
              <Button
                variant="outline"
                size="sm"
                onClick={loadFiles}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>

              {selectedFiles.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteFiles}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete ({selectedFiles.size})
                </Button>
              )}
            </div>
          </div>

          {/* File List */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {searchTerm || filterType !== 'all' ? 'No files match your criteria' : 'No files found'}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
                {filteredFiles.map((file) => (
                  <motion.div
                    key={file.path}
                    whileHover={{ scale: 1.02 }}
                    className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                      selectedFiles.has(file.path)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => toggleFileSelection(file.path)}
                  >
                    {/* File Preview */}
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      {file.type === 'image' ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : file.type === 'video' ? (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                          <Video className="w-8 h-8 text-white" />
                        </div>
                      ) : (
                        getFileIcon(file)
                      )}
                    </div>

                    {/* File Info */}
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewFile(file);
                          }}
                          className="p-1 bg-black/50 text-white rounded hover:bg-black/70"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(file);
                          }}
                          className="p-1 bg-black/50 text-white rounded hover:bg-black/70"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredFiles.map((file) => (
                  <div
                    key={file.path}
                    className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                      selectedFiles.has(file.path) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => toggleFileSelection(file.path)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getFileIcon(file)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)} • {file.lastModified.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewFile(file);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(file);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(file);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selection Actions */}
          {onFileSelect && selectedFiles.size === 1 && (
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  const selectedPath = Array.from(selectedFiles)[0];
                  const file = files.find(f => f.path === selectedPath);
                  if (file) {
                    onFileSelect(file);
                    onClose();
                  }
                }}
              >
                Select File
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* File Preview Modal */}
      {previewFile && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewFile(null)}
          title={previewFile.name}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="bg-black rounded-lg overflow-hidden">
              {previewFile.type === 'image' ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="w-full max-h-96 object-contain"
                />
              ) : previewFile.type === 'video' ? (
                <video
                  src={previewFile.url}
                  controls
                  className="w-full max-h-96"
                />
              ) : (
                <div className="flex items-center justify-center h-48">
                  <div className="text-center text-gray-400">
                    {getFileIcon(previewFile)}
                    <p className="mt-2">Preview not available</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Size:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {formatFileSize(previewFile.size)}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Modified:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {previewFile.lastModified.toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => handleCopyUrl(previewFile)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy URL
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownload(previewFile)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};