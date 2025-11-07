import { supabase } from '../lib/supabase';

export interface VideoProcessingResult {
  success: boolean;
  thumbnailUrl?: string;
  thumbnailPath?: string;
  error?: string;
}

export class VideoProcessorService {
  // Process video to generate thumbnail
  static async processVideo(filePath: string, projectId: string): Promise<VideoProcessingResult> {
    try {
      const { data, error } = await supabase.functions.invoke('video-processor', {
        body: {
          filePath,
          projectId
        }
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return data;
    } catch (error) {
      console.error('Video processing error:', error);
      return {
        success: false,
        error: 'Failed to process video'
      };
    }
  }

  // Extract video metadata (duration, dimensions, etc.)
  static async extractVideoMetadata(file: File): Promise<{
    duration: number;
    width: number;
    height: number;
  }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        resolve({
          duration: Math.round(video.duration),
          width: video.videoWidth,
          height: video.videoHeight
        });
        
        // Clean up
        URL.revokeObjectURL(video.src);
      };
      
      video.onerror = () => {
        reject(new Error('Failed to load video metadata'));
        URL.revokeObjectURL(video.src);
      };
      
      video.src = URL.createObjectURL(file);
    });
  }

  // Generate client-side video thumbnail (fallback)
  static async generateClientThumbnail(file: File, timeOffset: number = 1): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        video.currentTime = Math.min(timeOffset, video.duration - 0.1);
      };
      
      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
          
          // Clean up
          URL.revokeObjectURL(video.src);
        }, 'image/jpeg', 0.8);
      };
      
      video.onerror = () => {
        reject(new Error('Failed to load video'));
        URL.revokeObjectURL(video.src);
      };
      
      video.src = URL.createObjectURL(file);
    });
  }

  // Validate video file
  static validateVideoFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only MP4, WebM, and QuickTime videos are allowed.'
      };
    }
    
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size too large. Maximum size is 100MB.'
      };
    }
    
    return { valid: true };
  }
}