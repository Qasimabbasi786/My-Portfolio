import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crop, RotateCcw, Save, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | null;

export const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete,
  aspectRatio = 1,
  cropShape = 'round'
}) => {
  const [cropArea, setCropArea] = useState<CropArea>({ x: 50, y: 50, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [activeHandle, setActiveHandle] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0, width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageLoad = useCallback(() => {
    if (imageRef.current && containerRef.current) {
      const img = imageRef.current;

      // Calculate initial crop area based on image size
      const imgRect = img.getBoundingClientRect();

      const size = Math.min(imgRect.width, imgRect.height) * 0.6;
      const x = (imgRect.width - size) / 2;
      const y = (imgRect.height - size) / 2;

      setCropArea({
        x,
        y,
        width: size,
        height: aspectRatio === 1 ? size : size / aspectRatio
      });

      setImageLoaded(true);
    }
  }, [aspectRatio]);

  const handleMouseDown = useCallback((e: React.MouseEvent, handle?: ResizeHandle) => {
    e.preventDefault();
    e.stopPropagation();

    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();

    if (handle) {
      setIsResizing(true);
      setActiveHandle(handle);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        cropX: cropArea.x,
        cropY: cropArea.y,
        width: cropArea.width,
        height: cropArea.height
      });
    } else {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - rect.left - cropArea.x,
        y: e.clientY - rect.top - cropArea.y,
        cropX: cropArea.x,
        cropY: cropArea.y,
        width: cropArea.width,
        height: cropArea.height
      });
    }
  }, [cropArea]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current || !containerRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging) {
      const maxX = rect.width - cropArea.width;
      const maxY = rect.height - cropArea.height;
      const newX = Math.max(0, Math.min(mouseX - dragStart.x, maxX));
      const newY = Math.max(0, Math.min(mouseY - dragStart.y, maxY));

      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing && activeHandle) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      let newX = dragStart.cropX;
      let newY = dragStart.cropY;
      let newWidth = dragStart.width;
      let newHeight = dragStart.height;

      switch (activeHandle) {
        case 'se':
          newWidth = Math.max(50, dragStart.width + deltaX);
          newHeight = aspectRatio === 1 ? newWidth : newWidth / aspectRatio;
          break;
        case 'sw':
          newWidth = Math.max(50, dragStart.width - deltaX);
          newHeight = aspectRatio === 1 ? newWidth : newWidth / aspectRatio;
          newX = dragStart.cropX + dragStart.width - newWidth;
          break;
        case 'ne':
          newWidth = Math.max(50, dragStart.width + deltaX);
          newHeight = aspectRatio === 1 ? newWidth : newWidth / aspectRatio;
          newY = dragStart.cropY + dragStart.height - newHeight;
          break;
        case 'nw':
          newWidth = Math.max(50, dragStart.width - deltaX);
          newHeight = aspectRatio === 1 ? newWidth : newWidth / aspectRatio;
          newX = dragStart.cropX + dragStart.width - newWidth;
          newY = dragStart.cropY + dragStart.height - newHeight;
          break;
      }

      // Constrain to image bounds
      if (newX < 0) {
        newWidth += newX;
        newHeight = aspectRatio === 1 ? newWidth : newWidth / aspectRatio;
        newX = 0;
      }
      if (newY < 0) {
        newHeight += newY;
        newWidth = aspectRatio === 1 ? newHeight : newHeight * aspectRatio;
        newY = 0;
      }
      if (newX + newWidth > rect.width) {
        newWidth = rect.width - newX;
        newHeight = aspectRatio === 1 ? newWidth : newWidth / aspectRatio;
      }
      if (newY + newHeight > rect.height) {
        newHeight = rect.height - newY;
        newWidth = aspectRatio === 1 ? newHeight : newHeight * aspectRatio;
      }

      setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, activeHandle, dragStart, cropArea, aspectRatio]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setActiveHandle(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      const handleGlobalMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
        setActiveHandle(null);
      };

      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging, isResizing]);

  const handleZoomIn = useCallback(() => {
    if (imageRef.current && cropArea.width > 50) {
      const rect = imageRef.current.getBoundingClientRect();
      const reduction = cropArea.width * 0.1;
      const newWidth = Math.max(50, cropArea.width - reduction);
      const newHeight = aspectRatio === 1 ? newWidth : newWidth / aspectRatio;

      const centerX = cropArea.x + cropArea.width / 2;
      const centerY = cropArea.y + cropArea.height / 2;

      const maxX = rect.width - newWidth;
      const maxY = rect.height - newHeight;
      const newX = Math.max(0, Math.min(centerX - newWidth / 2, maxX));
      const newY = Math.max(0, Math.min(centerY - newHeight / 2, maxY));

      setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
      setZoom(prev => Math.min(3, prev + 0.1));
    }
  }, [cropArea, aspectRatio]);

  const handleZoomOut = useCallback(() => {
    if (imageRef.current) {
      const imgRect = imageRef.current.getBoundingClientRect();
      const maxSize = Math.min(imgRect.width, imgRect.height);

      if (cropArea.width < maxSize) {
        const increase = cropArea.width * 0.1;
        const newWidth = Math.min(maxSize, cropArea.width + increase);
        const newHeight = aspectRatio === 1 ? newWidth : newWidth / aspectRatio;

        const centerX = cropArea.x + cropArea.width / 2;
        const centerY = cropArea.y + cropArea.height / 2;

        const maxX = imgRect.width - newWidth;
        const maxY = imgRect.height - newHeight;
        const newX = Math.max(0, Math.min(centerX - newWidth / 2, maxX));
        const newY = Math.max(0, Math.min(centerY - newHeight / 2, maxY));

        setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
        setZoom(prev => Math.max(1, prev - 0.1));
      }
    }
  }, [cropArea, aspectRatio]);

  const handleCrop = useCallback(async () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx) return;

    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    ctx.clearRect(0, 0, outputSize, outputSize);

    if (cropShape === 'round') {
      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    ctx.drawImage(
      img,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      outputSize,
      outputSize
    );

    canvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob);
      }
    }, 'image/jpeg', 0.95);
  }, [cropArea, cropShape, onCropComplete]);

  const resetCrop = useCallback(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      const size = Math.min(img.width, img.height) * 0.6;
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;

      setCropArea({
        x,
        y,
        width: size,
        height: aspectRatio === 1 ? size : size / aspectRatio
      });
      setZoom(1);
    }
  }, [aspectRatio]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crop Image" maxWidth="2xl">
      <div className="space-y-6">
        <div
          ref={containerRef}
          className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden select-none flex items-center justify-center"
          style={{ minHeight: '400px' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            className="max-w-full max-h-96 object-contain"
            style={{ display: 'block' }}
            onLoad={handleImageLoad}
            draggable={false}
          />

          {imageLoaded && (
            <>
              <div className="absolute inset-0 bg-black/50 pointer-events-none" />

              <div
                className={`absolute border-2 border-white shadow-lg ${
                  cropShape === 'round' ? 'rounded-full' : 'rounded'
                } ${isDragging ? 'cursor-move' : 'cursor-grab'}`}
                style={{
                  left: (imageRef.current && containerRef.current)
                    ? (imageRef.current.getBoundingClientRect().left - containerRef.current.getBoundingClientRect().left) + cropArea.x
                    : cropArea.x,
                  top: (imageRef.current && containerRef.current)
                    ? (imageRef.current.getBoundingClientRect().top - containerRef.current.getBoundingClientRect().top) + cropArea.y
                    : cropArea.y,
                  width: cropArea.width,
                  height: cropArea.height,
                  backgroundColor: 'transparent',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                }}
                onMouseDown={(e) => handleMouseDown(e)}
              >
                <div
                  className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize hover:scale-125 transition-transform z-10"
                  onMouseDown={(e) => handleMouseDown(e, 'nw')}
                />
                <div
                  className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize hover:scale-125 transition-transform z-10"
                  onMouseDown={(e) => handleMouseDown(e, 'ne')}
                />
                <div
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize hover:scale-125 transition-transform z-10"
                  onMouseDown={(e) => handleMouseDown(e, 'sw')}
                />
                <div
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize hover:scale-125 transition-transform z-10"
                  onMouseDown={(e) => handleMouseDown(e, 'se')}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handleZoomIn} title="Zoom In (Smaller crop area)">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button type="button" variant="outline" onClick={handleZoomOut} title="Zoom Out (Larger crop area)">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button type="button" variant="outline" onClick={resetCrop}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="button" onClick={handleCrop}>
              <Crop className="w-4 h-4 mr-2" />
              Crop & Save
            </Button>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </Modal>
  );
};