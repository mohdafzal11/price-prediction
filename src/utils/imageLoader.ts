import { ImageLoaderProps } from 'next/image';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
const basePath = publicRuntimeConfig?.basePath || '';

export const imageLoader = ({ src, width, quality }: ImageLoaderProps): string => {
  // Handle external URLs
  if (src.startsWith('http')) {
    // External images should be returned as-is
    return src;
  }

  // Handle SVG and WebP images from the local filesystem
  if (src.startsWith('/')) {
    // Prepend basePath if needed
    const fullPath = `${src}`;
    
    // For SVGs, return directly without query params
    if (src.endsWith('.svg')) {
      return fullPath;
    }
    
    // For other images (including WebP), add width and quality params
    return `${fullPath}?w=${width || 640}&q=${quality || 75}`;
  }
  
  // Fallback: return the source as-is if it doesn't match the above cases
  return src;
};

export default imageLoader;
