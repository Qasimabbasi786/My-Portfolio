import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Play, Pause, Volume2, VolumeX, Loader } from 'lucide-react';
import { Button } from './Button';
import { VideoProcessorService } from '../../services/videoProcessor';
import { StorageService } from '../../services/storage';

interface VideoUploadProps {
  onVideoUpload: (videoUrl: string, thumbnailUrl?: string, metadata?: any) => Promise<void> | void;
  className?: string;
  maxSize?: number; // in bytes
  projectId?: string;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({
  onVideoUpload,
  className = '',
  maxSize = 100 * 1024 * 1024, // 100MB default
  projectId
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file
    const validation = VideoProcessorService.validateVideoFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith('video/')) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Extract video metadata
      const metadata = await VideoProcessorService.extractVideoMetadata(selectedFile);

      // Upload video to storage
      const uploadResult = await StorageService.uploadProjectVideo(selectedFile, projectId);
      
      if (!uploadResult.success) {
        alert(uploadResult.message || 'Upload failed');
        return;
      }

      setUploadProgress(100);

      // Process video for thumbnail generation
      if (uploadResult.path && projectId) {
        setIsProcessing(true);
        const processingResult = await VideoProcessorService.processVideo(
          uploadResult.path,
          projectId
        );

        if (processingResult.success) {
          await onVideoUpload(uploadResult.url!, processingResult.thumbnailUrl, {
            ...metadata,
            file_size: selectedFile.size,
            file_type: 'video'
          });
        } else {
          // Upload succeeded but processing failed - still save the video
          await onVideoUpload(uploadResult.url!, undefined, {
            ...metadata,
            file_size: selectedFile.size,
            file_type: 'video'
          });
        }
      } else {
        await onVideoUpload(uploadResult.url!, undefined, {
          ...metadata,
          file_size: selectedFile.size,
          file_type: 'video'
        });
      }

      // Reset state
      setSelectedFile(null);
      setPreviewUrl('');
      setUploadProgress(0);
      
    } catch (error) {
      console.error('Video upload error:', error);
      alert('An error occurred during upload');
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    setUploadProgress(0);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {!selectedFile ? (
        <div
          className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-300 cursor-pointer group"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-300">
              <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Upload Video
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Drag and drop a video file here, or click to browse
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Supports MP4, WebM, QuickTime • Max {Math.round(maxSize / (1024 * 1024))}MB
              </p>
            </div>
          </motion.div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Video Preview */}
          <div className="relative bg-black rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              src={previewUrl}
              className="w-full h-64 object-contain"
              muted={isMuted}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlayPause}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMute}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>
          </div>

          {/* File Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedFile.name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
            
            {/* Upload Progress */}
            <AnimatePresence>
              {(isUploading || isProcessing) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {isProcessing ? 'Processing video...' : 'Uploading...'}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {isProcessing ? '' : `${uploadProgress}%`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: isProcessing ? '100%' : `${uploadProgress}%` 
                      }}
                      transition={{ 
                        duration: isProcessing ? 2 : 0.3,
                        repeat: isProcessing ? Infinity : 0,
                        repeatType: isProcessing ? 'reverse' : undefined
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading || isProcessing}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            
            <Button
              onClick={handleUpload}
              disabled={isUploading || isProcessing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isUploading || isProcessing ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {isProcessing ? 'Processing...' : isUploading ? 'Uploading...' : 'Upload Video'}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};