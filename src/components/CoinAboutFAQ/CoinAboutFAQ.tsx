import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getApiUrl } from 'utils/config';
import { useTheme } from "styled-components";


interface TokenData {
  id: string;
  ticker: string;
  name: string;
  symbol?: string;
  rank?: number;
  currentPrice: {
    usd: number;
    lastUpdated: Date;
  };
  marketData: {
    marketCap?: number;
    fdv?: number;
    volume24h?: number;
    totalSupply?: number;
    circulatingSupply?: number;
    maxSupply?: number;
  };
  networkAddresses: {
    networkType: {
      name: string;
      network: string;
    };
    address: string;
  }[];
  categories: {
    category: {
      name: string;
      description: string;
    };
  }[];
  socials: {
    website: string[];
    twitter: string[];
    telegram: string[];
    discord: string[];
    github: string[];
    explorer: string[];
  };
  description?: string;
  cmcId?: string;
  cmcSlug?: string;
  priceChanges: {
    hour1?: number;
    day1?: number;
    month1?: number;
    year1?: number;
    lastUpdated: Date;
  };
  history: {
    timestamp: Date;
    price: number;
    marketCap?: number;
    volume?: number;
  }[];
  tradingMarkets?: any[];
}

interface CoinAboutFAQProps {
  coin: TokenData;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  generatedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface FAQResponse {
  token: {
    id: string;
    name: string;
    ticker: string;
  };
  faqs: FAQ[];
  total: number;
  lastUpdated: string | null;
  generatedFromAI: boolean;
}

interface CombinedFAQ {
  q: string;
  a: string;
  id: string;
  source: 'api' | 'description';
}

const FaqShimmer = () => {
  const theme = useTheme();
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      padding: '0px 12px',
      gap: '12px',
    }}>
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          style={{
            height: '100px',
            background: theme.name === 'dark'
              ? 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)'
              : 'linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)',
            borderRadius: '8px',
            animation: 'shimmer 1.5s infinite',
            backgroundSize: '200% 100%',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

const CoinAboutFAQ: React.FC<CoinAboutFAQProps> = ({ coin }) => {
  const [apiFaqs, setApiFaqs] = useState<FAQ[]>([]);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState<boolean>(true);
  const [faqError, setFaqError] = useState<string | null>(null);

  // Fetch FAQs from API
  useEffect(() => {
    const fetchFAQs = async () => {
      if (!coin?.ticker && !coin?.cmcId && !coin?.id) {
        setIsLoadingFaqs(false);
        return;
      }

      try {
        setIsLoadingFaqs(true);
        setFaqError(null);

        const identifier = coin.ticker || coin.cmcId || coin.id;
        const response = await fetch(getApiUrl(`/coin/faqs/${identifier}`));

        if (!response.ok) {
          throw new Error(`Failed to fetch FAQs: ${response.status}`);
        }

        const data: FAQResponse = await response.json();
        const uniqueFaqs = Array.from(
          new Map((data.faqs || []).map(faq => [faq.question.toLowerCase(), faq])).values()
        );
        setApiFaqs(uniqueFaqs);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        setFaqError(error instanceof Error ? error.message : 'Failed to load FAQs');
        setApiFaqs([]);
      } finally {
        setIsLoadingFaqs(false);
      }
    };

    fetchFAQs();
  }, [coin.ticker, coin.cmcId, coin.id]);
  // Parse the description JSON (existing FAQs)
  const getFAQSections = () => {
    try {
      if (!coin.description) return [];
      const descriptionData = JSON.parse(coin.description);
      return Array.isArray(descriptionData) ? descriptionData : [];
    } catch (error) {
      console.error("Error parsing description data:", error);
      return [];
    }
  };

  // Format text with proper line breaks and markdown-like formatting
  const formatText = (text: string) => {
    let formattedText = text.replace(/\\n/g, '\n');
    formattedText = formattedText.replace(/\(Note:.*?\)/g, '');
    formattedText = formattedText.replace(/coinmarketcap/gi, 'DroomDroom');
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedText = formattedText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    formattedText = formattedText.replace(/\n/g, '<br>');
    formattedText = formattedText.replace(/\s{2,}/g, ' ');
    return formattedText;
  };

  // Combine and filter FAQs based on price change
  const getAllFAQs = (): CombinedFAQ[] => {
    const combinedFaqs: CombinedFAQ[] = [];
    const priceChange = coin?.priceChanges?.day1 || 0;
    const isPositive = priceChange > 0;
    const isNegative = priceChange < 0;
    const isNeutral = priceChange === 0;

    // Filter API FAQs
    const filteredApiFaqs = apiFaqs.filter(faq => {
      const questionLower = faq.question.toLowerCase();
      if (isPositive && questionLower.includes('why') && questionLower.includes('price') && questionLower.includes('down')) {
        return false;
      }
      if (isNegative && questionLower.includes('why') && questionLower.includes('price') && questionLower.includes('up')) {
        return false;
      }
      if (isNeutral && questionLower.includes('why') && questionLower.includes('price') &&
        (questionLower.includes('up') || questionLower.includes('down'))) {
        return false;
      }
      return !(
        questionLower.includes('related pages') ||
        questionLower.includes('related articles') ||
        questionLower.includes('crypto wallets')
      );
    });

    // Add filtered API FAQs
    filteredApiFaqs.forEach(faq => {
      combinedFaqs.push({
        q: faq.question,
        a: faq.answer,
        id: faq.id,
        source: 'api'
      });
    });

    // Filter description FAQs
    const descriptionFaqs = getFAQSections();
    if (descriptionFaqs.length > 0) {
      descriptionFaqs
        .filter((section: { q: string; a: string }) => {
          const questionLower = section.q.toLowerCase();
          if (isPositive && questionLower.includes('why') && questionLower.includes('price') && questionLower.includes('down')) {
            return false;
          }
          if (isNegative && questionLower.includes('why') && questionLower.includes('price') && questionLower.includes('up')) {
            return false;
          }
          if (isNeutral && questionLower.includes('why') && questionLower.includes('price') &&
            (questionLower.includes('up') || questionLower.includes('down'))) {
            return false;
          }
          return !(
            questionLower.includes('related pages') ||
            questionLower.includes('related articles') ||
            questionLower.includes('crypto wallets')
          );
        })
        .forEach((section: { q: string; a: string }, index: number) => {
          combinedFaqs.push({
            q: section.q,
            a: section.a,
            id: `desc-${index}`,
            source: 'description'
          });
        });
    }

    return combinedFaqs;
  };

  const displayFAQs = getAllFAQs();

  return (
    <FAQWrapper>
      {isLoadingFaqs ? (
        <FaqShimmer />
      ) : (
        <FAQList>
          {displayFAQs.length > 0 ? (
            displayFAQs.map((section: CombinedFAQ, index: number) => (
              <FAQItemWrapper key={section.id || index}>
                <Question>{section.q}</Question>
                <Answer>
                  <div dangerouslySetInnerHTML={{ __html: formatText(section.a) }} />
                </Answer>
              </FAQItemWrapper>
            ))
          ) : (
            <NoFAQsWrapper>
              <NoFAQsText>No frequently asked questions available for {coin.name} yet.</NoFAQsText>
              <NoFAQsSubtext>Check back later for updates!</NoFAQsSubtext>
            </NoFAQsWrapper>
          )}
        </FAQList>
      )}
    </FAQWrapper>
  );
};

// Styled components
const FAQWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 16px 0px;
`;

const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const FAQItemWrapper = styled.div`
  margin-bottom: 16px;
  border: 1px solid ${props => props.theme.colors.borderColor};
  border-radius: 8px;
  border-width: 1px;
  border-style: solid !important;
  overflow: hidden;
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: ${props => props.theme.colors.cardBackground};
  padding: 16px;
`;

const Question = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  padding: 0;
  color: ${props => props.theme.colors.text};
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const Answer = styled.div`
  font-size: 15px;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
  
  p {
    margin-top: 0;
    margin-bottom: 16px;
  }
  
  ul, ol {
    margin-left: 20px;
    margin-bottom: 16px;
    padding-left: 12px;
  }
  
  li {
    margin-bottom: 8px;
  }
  
  strong {
    color: ${props => props.theme.colors.text};
    font-weight: 600;
  }
  
  a {
    color: #16c784;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const NoFAQsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const NoFAQsText = styled.p`
  color: ${props => props.theme.colors.text};
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px 0;
`;

const NoFAQsSubtext = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
  margin: 0;
`;

export default CoinAboutFAQ;