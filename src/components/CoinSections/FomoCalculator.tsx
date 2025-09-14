import React from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import imageLoader from 'src/utils/imageLoader';

import { SectionContainer } from './SectionContainer';

const FomoContainer = styled(SectionContainer)`
  margin: 0;
`;

const ComparisonGrid = styled.div`
  max-width: 480px;
`;

const ComparisonCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  padding: 1.75rem;
  text-align: center;
  transition: transform 0.2s ease-in-out;
  background: ${props => props.theme.colors.background};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.borderColor};
  &:hover {
    transform: translateY(-2px);
  }
`;

const CryptoValuesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const CryptoValue = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 8px;
  
  .crypto-name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    
    img {
      width: 20px;
      height: 20px;
    }
  }
  
  .value {
    font-size: 1.125rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

interface Comparison {
  id: string;
  item: string;
  originalPrice: number;
  date: string;
  cryptoValues: {
    btc: number;
    eth: number;
    xrp: number;
    ltc: number;
    doge: number;
  };
}

const mockComparisons: Comparison[] = [
  {
    id: 'netflix_2015',
    item: 'Netflix Annual Subscription (2015)',
    originalPrice: 107.88,
    date: '2015-01-01',
    cryptoValues: {
      btc: 42500,
      eth: 38900,
      xrp: 28700,
      ltc: 31200,
      doge: 25800
    }
  },
  {
    id: 'ps5_2020',
    item: 'PlayStation 5 (2020)',
    originalPrice: 499,
    date: '2020-11-12',
    cryptoValues: {
      btc: 3200,
      eth: 2800,
      xrp: 1900,
      ltc: 2100,
      doge: 1600
    }
  },
  {
    id: 'tesla_stock_2019',
    item: '10 Tesla Shares (2019)',
    originalPrice: 845,
    date: '2019-01-02',
    cryptoValues: {
      btc: 12800,
      eth: 9600,
      xrp: 7200,
      ltc: 8400,
      doge: 6100
    }
  },
  {
    id: 'airpods_2019',
    item: 'AirPods Pro (2019)',
    originalPrice: 249,
    date: '2019-10-30',
    cryptoValues: {
      btc: 4200,
      eth: 3600,
      xrp: 2800,
      ltc: 3100,
      doge: 2400
    }
  },
  {
    id: 'uber_rides_2018',
    item: 'Monthly Uber Rides for a Year (2018)',
    originalPrice: 1200,
    date: '2018-01-01',
    cryptoValues: {
      btc: 28500,
      eth: 24200,
      xrp: 18600,
      ltc: 21400,
      doge: 16800
    }
  },
  {
    id: 'amazon_prime_2017',
    item: 'Amazon Prime (5 Years)',
    originalPrice: 495,
    date: '2017-01-01',
    cryptoValues: {
      btc: 38900,
      eth: 32600,
      xrp: 25400,
      ltc: 28900,
      doge: 22100
    }
  },
  {
    id: 'spotify_2016',
    item: 'Spotify Premium (3 Years)',
    originalPrice: 359.64,
    date: '2016-01-01',
    cryptoValues: {
      btc: 45800,
      eth: 39200,
      xrp: 31500,
      ltc: 35600,
      doge: 28400
    }
  },
  {
    id: 'gaming_pc_2020',
    item: 'High-End Gaming PC (2020)',
    originalPrice: 2499,
    date: '2020-06-01',
    cryptoValues: {
      btc: 15600,
      eth: 12800,
      xrp: 9400,
      ltc: 10800,
      doge: 8200
    }
  },
  {
    id: 'iphone_13_2021',
    item: 'iPhone 13 Pro (2021)',
    originalPrice: 999,
    date: '2021-09-24',
    cryptoValues: {
      btc: 4800,
      eth: 3900,
      xrp: 2600,
      ltc: 3200,
      doge: 2100
    }
  },
  {
    id: 'meta_quest_2020',
    item: 'Meta Quest 2 (2020)',
    originalPrice: 299,
    date: '2020-10-13',
    cryptoValues: {
      btc: 2100,
      eth: 1800,
      xrp: 1200,
      ltc: 1500,
      doge: 900
    }
  },
  {
    id: 'macbook_pro_2015',
    item: 'MacBook Pro 15" (2015)',
    originalPrice: 2499,
    date: '2015-03-15',
    cryptoValues: {
      btc: 425830,
      eth: 380000,
      xrp: 290000,
      ltc: 320000,
      doge: 250000
    }
  },
  {
    id: 'ps4',
    item: 'PlayStation 4 (2013)',
    originalPrice: 399,
    date: '2013-11-15',
    cryptoValues: {
      btc: 97520,
      eth: 85000,
      xrp: 65000,
      ltc: 75000,
      doge: 55000
    }
  },
  {
    id: 'airpods',
    item: 'AirPods (2016)',
    originalPrice: 159,
    date: '2016-12-13',
    cryptoValues: {
      btc: 18650,
      eth: 16500,
      xrp: 12500,
      ltc: 14500,
      doge: 10500
    }
  },
  // Subscriptions
  {
    id: 'netflix_2013',
    item: 'Netflix Annual Subscription (2013)',
    originalPrice: 95.88,
    date: '2013-01-01',
    cryptoValues: {
      btc: 23421,
      eth: 21000,
      xrp: 18000,
      ltc: 19500,
      doge: 16000
    }
  },
  {
    id: 'spotify_2015',
    item: 'Spotify Premium Annual (2015)',
    originalPrice: 119.88,
    date: '2015-01-01',
    cryptoValues: {
      btc: 20440,
      eth: 18500,
      xrp: 15500,
      ltc: 17000,
      doge: 13500
    }
  },
  {
    id: 'amazon_prime_2014',
    item: 'Amazon Prime Annual (2014)',
    originalPrice: 99,
    date: '2014-01-01',
    cryptoValues: {
      btc: 19800,
      eth: 17500,
      xrp: 14500,
      ltc: 16000,
      doge: 12500
    }
  },
  // Food & Drinks
  {
    id: 'starbucks_2013',
    item: 'Daily Starbucks Coffee for a Year (2013)',
    originalPrice: 1460,
    date: '2013-01-01',
    cryptoValues: {
      btc: 356940,
      eth: 320000,
      xrp: 280000,
      ltc: 300000,
      doge: 260000
    }
  },
  {
    id: 'chipotle_2015',
    item: 'Weekly Chipotle for a Year (2015)',
    originalPrice: 520,
    date: '2015-01-01',
    cryptoValues: {
      btc: 88660,
      eth: 75000,
      xrp: 65000,
      ltc: 70000,
      doge: 55000
    }
  },
  // Gaming
  {
    id: 'minecraft_2011',
    item: 'Minecraft (2011)',
    originalPrice: 26.95,
    date: '2011-11-18',
    cryptoValues: {
      btc: 9890,
      eth: 8500,
      xrp: 6500,
      ltc: 7500,
      doge: 5500
    }
  },
  {
    id: 'steam_2014',
    item: 'Average Steam Game (2014)',
    originalPrice: 14.99,
    date: '2014-06-01',
    cryptoValues: {
      btc: 2990,
      eth: 2500,
      xrp: 1800,
      ltc: 2200,
      doge: 1500
    }
  },
  // Tech Services
  {
    id: 'aws_2013',
    item: 'Basic AWS Hosting for a Year (2013)',
    originalPrice: 180,
    date: '2013-01-01',
    cryptoValues: {
      btc: 43980,
      eth: 38000,
      xrp: 32000,
      ltc: 35000,
      doge: 28000
    }
  },
  {
    id: 'domain_2012',
    item: 'Domain Name Registration (2012)',
    originalPrice: 10,
    date: '2012-01-01',
    cryptoValues: {
      btc: 2890,
      eth: 2500,
      xrp: 1800,
      ltc: 2200,
      doge: 1500
    }
  },
  // Education
  {
    id: 'udemy_2015',
    item: 'Udemy Web Dev Course (2015)',
    originalPrice: 11.99,
    date: '2015-01-01',
    cryptoValues: {
      btc: 2045,
      eth: 1800,
      xrp: 1200,
      ltc: 1500,
      doge: 900
    }
  },
  {
    id: 'coursera_2014',
    item: 'Coursera Specialization (2014)',
    originalPrice: 49,
    date: '2014-01-01',
    cryptoValues: {
      btc: 9800,
      eth: 8500,
      xrp: 6500,
      ltc: 7500,
      doge: 5500
    }
  },
  // Transportation
  {
    id: 'uber_2014',
    item: 'Monthly Uber Rides for a Year (2014)',
    originalPrice: 1200,
    date: '2014-01-01',
    cryptoValues: {
      btc: 240000,
      eth: 210000,
      xrp: 180000,
      ltc: 195000,
      doge: 165000
    }
  },
  {
    id: 'tesla_2013',
    item: 'Tesla Model S (2013)',
    originalPrice: 69900,
    date: '2013-06-01',
    cryptoValues: {
      btc: 17089550,
      eth: 15000000,
      xrp: 12000000,
      ltc: 13500000,
      doge: 10000000
    }
  },
  // Entertainment
  {
    id: 'movie_tickets_2013',
    item: 'Monthly Movie Tickets for a Year (2013)',
    originalPrice: 120,
    date: '2013-01-01',
    cryptoValues: {
      btc: 29320,
      eth: 26000,
      xrp: 22000,
      ltc: 24000,
      doge: 20000
    }
  },
  {
    id: 'disney_plus_2019',
    item: 'Disney+ Annual Subscription (2019)',
    originalPrice: 69.99,
    date: '2019-11-12',
    cryptoValues: {
      btc: 4890,
      eth: 4200,
      xrp: 3500,
      ltc: 3800,
      doge: 3000
    }
  },
  // Social Media
  {
    id: 'facebook_stock_2012',
    item: '10 Facebook Shares (2012)',
    originalPrice: 380,
    date: '2012-05-18',
    cryptoValues: {
      btc: 110200,
      eth: 95000,
      xrp: 82000,
      ltc: 88000,
      doge: 75000
    }
  },
  {
    id: 'twitter_stock_2013',
    item: '20 Twitter Shares (2013)',
    originalPrice: 520,
    date: '2013-11-07',
    cryptoValues: {
      btc: 127140,
      eth: 110000,
      xrp: 95000,
      ltc: 102000,
      doge: 88000
    }
  },
];

const cryptos = [
  { name: 'Bitcoin', symbol: 'btc', icon: '/price/static/icons/btc.webp' },
  { name: 'Ethereum', symbol: 'eth', icon: '/price/static/icons/eth.webp' },
  { name: 'XRP', symbol: 'xrp', icon: '/price/static/icons/xrp.webp' },
  { name: 'Litecoin', symbol: 'ltc', icon: '/price/static/icons/ltc.webp' },
  { name: 'Dogecoin', symbol: 'doge', icon: '/price/static/icons/doge.webp' }
];

const FomoCalculator = () => {
  const [comparison, setComparison] = React.useState(() => {
    const index = Math.floor(Math.random() * mockComparisons.length);
    return mockComparisons[index];
  });

  const [crypto, setCrypto] = React.useState(() => {
    const index = Math.floor(Math.random() * cryptos.length);
    return cryptos[index];
  });

  const formattedDate = React.useMemo(() => {
    return new Date(comparison.date).toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [comparison.date]);

  return (
    <FomoContainer id="fomo">
      <ComparisonGrid>
        <ComparisonCard>
          {comparison.cryptoValues && (
            <>
              <Description>
                Instead of {comparison.item} costing ${comparison.originalPrice.toLocaleString()},
                if you had invested that amount in {crypto.name} on {formattedDate},
                it would now be worth ${comparison.cryptoValues[crypto.symbol]}!
              </Description>
              <CryptoValue style={{ marginTop: '1.5rem' }}>
                <div className="crypto-name">
                  <Image 
                    src={crypto.icon} 
                    alt={crypto.name} 
                    width={24} 
                    height={24} 
                    loader={imageLoader}
                  />
                  {crypto.name}
                </div>
                <div className="value">${comparison.cryptoValues[crypto.symbol].toLocaleString()}</div>
              </CryptoValue>
            </>
          )}
        </ComparisonCard>
      </ComparisonGrid>
    </FomoContainer>
  );
};

export default FomoCalculator;
