import React, { useState } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import { getApiUrl } from 'utils/config';

interface CoinImageProps {
  cmcId?: string | number;
  name?: string;
  size?: number;
  className?: string;
  fallbackUrl?: string;
}

const ImageContainer = styled.div<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
`;

const FallbackContainer = styled.div<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #666;
  font-size: ${props => props.size * 0.4}px;
  font-weight: bold;
`;

const StyledImage = styled(Image)`
  object-fit: cover;
`;

const CoinImage: React.FC<CoinImageProps> = ({ 
  cmcId, 
  name = 'Coin',
  size = 32,
  className,
  fallbackUrl
}) => {
  const [hasError, setHasError] = useState(false);
  
  // Return fallback element if no cmcId or error loading image
  if (!cmcId || hasError) {
    if (fallbackUrl) {
      return (
        <ImageContainer size={size} className={className}>
          <Image
            src={fallbackUrl}
            alt={name}
            width={size}
            height={size}
            priority={false}
            loading="lazy"
            onError={() => setHasError(true)}
          />
        </ImageContainer>
      );
    }
    
    return (
      <FallbackContainer size={size} className={className}>
        {name.charAt(0)}
      </FallbackContainer>
    );
  }
  
  // Construct the local proxy URL for the image
  // This will go through our API route to optimize and cache the image
  const imageUrl = `/api/coin-image/${cmcId}`;
  
  return (
    <ImageContainer size={size} className={className}>
      <StyledImage
        src={imageUrl}
        alt={name}
        width={size}
        height={size}
        priority={false} 
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </ImageContainer>
  );
};

export default CoinImage; 