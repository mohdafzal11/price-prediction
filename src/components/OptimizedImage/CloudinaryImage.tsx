import React from 'react';
import Image, { ImageProps } from 'next/image';
import { getLogoCloudinaryUrl } from 'src/utils/cloudinary';

interface CloudinaryImageProps extends Omit<ImageProps, 'src'> {
  theme: string;
  publicId?: string;
  width: number;
  height: number;
  isLCP?: boolean;
}

/**
 * CloudinaryImage component for optimized image loading via Cloudinary
 * Specifically designed for logos and critical images with LCP optimization
 */
const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  theme,
  publicId,
  width,
  height,
  isLCP = false,
  alt,
  ...props
}) => {
  // Generate the Cloudinary URL for the image
  const imageUrl = publicId 
    ? getLogoCloudinaryUrl(theme, width, height) 
    : getLogoCloudinaryUrl(theme, width, height);
  
  // For LCP images, we use specific optimizations
  const lcpProps = isLCP ? {
    priority: true,
    loading: 'eager' as const,
    fetchPriority: 'high' as const,
    sizes: `${width}px`,
    'data-lcp-element': 'true',
  } : {};

  return (
    <div
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        minWidth: `${width}px`,
        minHeight: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        style={{
          objectFit: 'contain',
          width: `${width}px`,
          height: `${height}px`,
          display: 'block',
          maxWidth: '100%',
        }}
        {...lcpProps}
        {...props}
      />
    </div>
  );
};

export default CloudinaryImage;
