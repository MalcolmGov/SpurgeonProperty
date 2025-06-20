import React, { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  quality = 85,
  loading = 'lazy',
  priority = false,
  fallback = '/placeholder-property.jpg',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    setImageSrc(fallback);
    onError?.();
  }, [fallback, onError]);

  // Generate optimized image URL (for future CDN integration)
  const getOptimizedSrc = (originalSrc: string) => {
    // For now, return original src
    // In production, this could integrate with a CDN service like Cloudinary or ImageKit
    // Example: `https://res.cloudinary.com/your-cloud/image/fetch/w_${width},h_${height},q_${quality},f_auto/${encodeURIComponent(originalSrc)}`
    return originalSrc;
  };

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}
      
      <img
        src={getOptimizedSrc(imageSrc)}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
      />
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
          Failed to load image
        </div>
      )}
    </div>
  );
}

// Hook for preloading critical images
export function useImagePreload(sources: string[]) {
  React.useEffect(() => {
    sources.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [sources]);
}