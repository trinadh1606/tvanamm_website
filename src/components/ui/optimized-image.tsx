import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  webpSrc?: string;
  fallbackSrc?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  webpSrc,
  fallbackSrc,
  alt,
  width,
  height,
  className,
  loading = 'lazy',
  priority = false,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [webpError, setWebpError] = useState(false);

  // Determine which image source to use
  const getImageSrc = () => {
    if (webpSrc && !webpError) return webpSrc;
    if (!imageError) return src;
    return fallbackSrc || src;
  };

  const handleImageError = () => {
    if (webpSrc && !webpError) {
      setWebpError(true);
    } else {
      setImageError(true);
    }
  };

  return (
    <picture>
      {webpSrc && !webpError && (
        <source srcSet={webpSrc} type="image/webp" />
      )}
      <img
        src={getImageSrc()}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        className={cn(
          'transition-opacity duration-300',
          className
        )}
        onError={handleImageError}
        {...props}
      />
    </picture>
  );
};