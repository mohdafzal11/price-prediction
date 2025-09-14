import React from 'react';
import styled from 'styled-components';
import Tabs from 'components/common/Tabs';
import { useRouter } from 'next/router';
import { useTheme } from 'styled-components';
import { useThemeContext } from '../../theme/ThemeProvider';


const TabList = styled.div`
  display: flex;
  gap: 32px;
  padding: 16px;
  height: 100%;
  background: ${props => props.theme.colors.background};


  @media (max-width: 768px) {
    gap: 16px;
    padding: 16px 0px;
  }
`;

const TabItem = styled.button<{ active: boolean }>`
  background: transparent;
  border: none;
  color: ${props => props.active ? '#0052FF' : props.theme.colors.textColor};
  padding: 0px 0px 4px 0px;
  font-size: 14px;
  position: relative;
  cursor: pointer;
  font-weight: ${props => props.active ? 600 : 400};
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${props => props.active ? '#0052FF' : 'transparent'};
    border-radius: 0px 0px 0px 0px;
    transition: all 0.2s ease;
  }

  &:hover {
    color: #0052FF;
    
    &:after {
      background: ${props => props.active ? '#0052FF' : 'rgba(0, 82, 255, 0.3)'};
    }
  }

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 0px 0px 4px 0px;
  }
`;

interface CoinTabsProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

const CoinTabs: React.FC<CoinTabsProps> = ({ activeTab, setActiveTab }) => {
  const router = useRouter();
  const { slug } = router.query;
  const theme = useTheme();
  const [themeState] = useThemeContext();

  const handleTabChange = (tabId: string) => {

    if (tabId === 'prediction') {
    setActiveTab(tabId);
    router.push(`/${slug}#${tabId}`, undefined, { shallow: true });
    }else{
      window.open(`https://droomdroom.com/price/${slug}#${tabId}`, "_blank");
    }
  
  };

  return (
    <TabList>
      <TabItem 
        active={activeTab === 'chart'} 
        onClick={() => handleTabChange('chart')}
      >
        Chart
      </TabItem>

      <TabItem 
        active={activeTab === 'markets'} 
        onClick={() => handleTabChange('markets')}
      >
        Markets
      </TabItem>
     
      {/* <TabItem 
        active={activeTab === 'tokenomics'} 
        onClick={() => handleTabChange('tokenomics')}
      >
        Tokenomics
      </TabItem> */}

      {/* <TabItem 
        active={activeTab === 'fomo'} 
        onClick={() => handleTabChange('fomo')}
      >
        FOMO Calculator
      </TabItem> */}


      <TabItem 
        active={activeTab === 'prediction'} 
        onClick={() => handleTabChange('prediction')}
      >
        Prediction
      </TabItem>

      <TabItem 
        active={activeTab === 'about'} 
        onClick={() => handleTabChange('about')}
      >
        About
      </TabItem>
    </TabList>
  );
};

export default CoinTabs;