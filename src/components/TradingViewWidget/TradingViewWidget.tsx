import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

declare global {
  interface Window {
    TradingView: any;
  }
}

const WidgetContainer = styled.div` 
  background: ${({ theme }) => theme.colors.cardBackground};
  overflow: hidden;
`;

interface TradingViewWidgetProps {
  symbol: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (container.current) {
        new window.TradingView.widget({
          container_id: container.current.id,
          symbol: symbol,
          interval: 'D',
          timezone: 'exchange',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: true,
          save_image: false,
          width: '100%',
        });
      }
    };
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [symbol]);

  return <WidgetContainer id="tradingview_widget" ref={container} />;
};

export default TradingViewWidget;
