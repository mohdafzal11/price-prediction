import {
  AdCardWrapper,
  ImageContainer,
  TextOverlay
} from './AdCard.styled';
import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

export default function AdCard({ url, source, text, darkSource, width = 300, height = 250 }: { 
    url?: string;
    source: string;
    text?: string;
    darkSource?: string;
    width?: number;
    height?: number;
}) {
    const theme = useContext(ThemeContext);
    const isDarkTheme = theme.name === 'dark';
    
    if (!darkSource){
        darkSource = source;
    }
    
    return (
        <AdCardWrapper>
          <div 
            onClick={() => {
              window.open(url, '_blank');
            }}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              flex: 1,
              display: 'flex'
            }}
          >
            <img 
              src={isDarkTheme ? darkSource : source} 
              alt="TOKEN2049 Promo Code"
              width={width}
              height={height}
              style={{ 
                maxWidth: '100%',
                maxHeight: '100%',
                borderRadius: '15px',
                objectFit: 'fill',
                display: 'block'
              }} 
              loading="eager"
              decoding="async"
              data-error-handled="true"
            />
            {text && <TextOverlay>{text}</TextOverlay>}
          </div>
        </AdCardWrapper>
    );
}