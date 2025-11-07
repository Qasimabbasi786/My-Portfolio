import React, { useState, useEffect } from 'react';
import { Upload, X, Star, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { ProjectImagesService } from '../../services/projectImages';
import { Button } from '../ui/Button';

interface ProjectImagesManagerProps {
  projectId: string;
  onImagesChange?: () => void;
}

interface ProjectImage {
  id: string;
  image_url: string;
  image_path: string;
  is_primary: boolean;
  created_at: string;
}

export const ProjectImagesManager: React.FC<ProjectImagesManagerProps> = ({
  projectId,
  onImagesChange
}) => {
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const MAX_IMAGES = 7;

  useEffect(() => {
    loadImages();
  }, [projectId]);

  const loadImages = async () => {
    setLoading(true);
    setError(null);

    const result = await ProjectImagesService.getProjectImages(projectId);

    if (result.success && result.data) {
      setImages(result.data);
    } else {
      setError(result.message || 'Failed to load images');
    }

    setLoading(false);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setSuccess(null);

    const currentCount = images.length;
    const filesToUpload = Array.from(files);

    if (currentCount + filesToUpload.length > MAX_IMAGES) {
      setError(`Cannot upload ${filesToUpload.length} images. Maximum ${MAX_IMAGES} images allowed (currently ${currentCount})`);
      event.target.value = '';
      return;
    }

    setUploading(true);

    const result = await ProjectImagesService.uploadMultipleProjectImages(
      filesToUpload,
      projectId
    );

    if (result.success) {
      setSuccess(result.message || 'Images uploaded successfully');
      await loadImages();
      onImagesChange?.();
    } else {
      setError(result.message || 'Failed to upload images');
    }

    setUploading(false);
    event.target.value = '';
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    setError(null);
    setSuccess(null);

    const result = await ProjectImagesService.deleteProjectImage(imageId);

    if (result.success) {
      setSuccess('Image deleted successfully');
      await loadImages();
      onImagesChange?.();
    } else {
      setError(result.message || 'Failed to delete image');
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    setError(null);
    setSuccess(null);

    const result = await ProjectImagesService.setPrimaryImage(imageId);

    if (result.success) {
      setSuccess('Primary image updated');
      await loadImages();
      onImagesChange?.();
    } else {
      setError(result.message || 'Failed to set primary image');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">Loading images...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Project Images ({images.length}/{MAX_IMAGES})
        </h3>
        <label
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
            images.length >= MAX_IMAGES || uploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload Images'}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            disabled={images.length >= MAX_IMAGES || uploading}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Image Upload Guidelines:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Maximum {MAX_IMAGES} images per project</li>
              <li>Allowed formats: JPG, PNG, WebP</li>
              <li>Maximum file size: 5MB per image</li>
              <li>First image is automatically set as primary/thumbnail</li>
              <li>Click the star icon to set a different primary image</li>
            </ul>
          </div>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">No images uploaded yet</p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Upload Your First Image
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <img
                src={image.image_url}
                alt="Project"
                className="w-full h-full object-cover"
              />

              {image.is_primary && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Primary
                </div>
              )}

              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center gap-2">
                <button
                  onClick={() => handleSetPrimary(image.id)}
                  disabled={image.is_primary}
                  className={`opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all ${
                    image.is_primary
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-yellow-500 hover:bg-yellow-600'
                  } text-white`}
                  title={image.is_primary ? 'Already primary' : 'Set as primary'}
                >
                  <Star className={`w-4 h-4 ${image.is_primary ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={() => handleDelete(image.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all text-white"
                  title="Delete image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
