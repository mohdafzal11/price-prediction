import {
    AdCardWrapper,
} from './MobileAdCard.styled';
import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

export default function AdCard({ url, source, text, darkSource }: {
    url?: string;
    source: string;
    text?: string;
    darkSource?: string;    
}) {
    const theme = useContext(ThemeContext);

    if (!darkSource) {
        darkSource = source;
    }

    return (

        <AdCardWrapper>
            <div style={{
                position: 'relative',
                height: '100%',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                overflow: 'hidden'
            }}
                onClick={() => window.open(url, '_blank')}>
                <div style={{ width: '100%', height: '100%', margin: '0 auto' }}>
                    <img
                        src={theme?.name === 'dark' ? darkSource : source}
                        alt="TOKEN2049 Promo Code"
                        width='100%'
                        height='100%'
                        loading="eager"
                        decoding="async"
                        style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '100%',
                            objectFit: 'fill'
                        }}
                    />
                </div>
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    color: '#e0e0e0',
                    background: 'rgba(0, 0, 0, 0.5)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    textAlign: 'right'
                }}>
                    Ad
                </div>
            </div>
        </AdCardWrapper>

    );
}