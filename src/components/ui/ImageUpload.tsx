import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { ImageCropper } from './ImageCropper';
import { StorageService } from '../../services/storage';

interface ImageUploadProps {
  currentImage?: string;
  onImageUpdate: (imageUrl: string) => Promise<void> | void;
  className?: string;
  uploadType?: 'avatar' | 'project' | 'developer';
  cropShape?: 'rect' | 'round';
  aspectRatio?: number;
  developerId?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageUpdate,
  className = '',
  uploadType = 'avatar',
  cropShape = 'round',
  aspectRatio = 1,
  developerId
}) => {
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsCropperOpen(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setIsUploading(true);
    try {
      const croppedFile = new File([croppedImageBlob], `cropped-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });

      let uploadResult;
      if (uploadType === 'developer' && developerId) {
        uploadResult = await StorageService.uploadDeveloperProfilePicture(
          croppedFile,
          developerId,
          currentImage
        );
      } else if (uploadType === 'avatar') {
        uploadResult = await StorageService.uploadAvatar(croppedFile);
      } else {
        uploadResult = await StorageService.uploadProjectImage(croppedFile);
      }

      if (uploadResult.success && uploadResult.url) {
        const result = onImageUpdate(uploadResult.url);
        if (result instanceof Promise) {
          await result;
        }
        setIsCropperOpen(false);
        setSelectedFile(null);
        setPreviewUrl('');
      } else {
        alert(uploadResult.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className={`relative group ${className}`}>
        <div
          className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 dark:border-blue-900/30 cursor-pointer group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-all duration-300"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          {currentImage ? (
            <img
              src={currentImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            {isUploading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-white" />
            )}
          </motion.div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />
      </div>

      {previewUrl && (
        <ImageCropper
          isOpen={isCropperOpen}
          onClose={() => {
            setIsCropperOpen(false);
            setSelectedFile(null);
            setPreviewUrl('');
          }}
          imageUrl={previewUrl}
          onCropComplete={handleCropComplete}
          aspectRatio={aspectRatio}
          cropShape={cropShape}
        />
      )}
    </>
  );
};