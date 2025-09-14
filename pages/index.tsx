import axios from "axios";
import SectionHeader from "components/SectionHeader/SectionHeader";
import Pagination from "components/Pagination/Pagination";
import HomeTable from "components/pages/home/HomeTable/HomeTable";
import SEO from "components/SEO/SEO";
import MarqueeScroll from "components/MarqueeScroll/MarqueeScroll";
import RSICards from "components/RSICard/RSICard";
import AdCard from "components/AdCard/AdCard";
import SmallCard from "components/SmallCard/SmallCard";
import styled from "styled-components";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { getApiUrl, getPageUrl } from "utils/config";
import MobileAdCard from "components/MobileAdCard/MobileAdCard";
import { Token, Pagination as PaginationData, Info } from "types";
import TrendingCard from "components/TrendingCard/TrendingCard";

interface HomeProps {
  tokens: Token[];
  pagination: PaginationData;
  info: Info;
}

export const getStaticProps = async () => {
  try {
    const page = 1;
    const pageSize = 20;

    const [response, info, topMovers] = await Promise.all([
      axios.get(getApiUrl("/coins"), { params: { page, pageSize } }),
      axios.get(getApiUrl("/info")),
      axios.get(getApiUrl("/top-movers")),
    ]);

    return {
      props: {
        tokens: response.data.tokens,
        pagination: response.data.pagination,
        info: {
          ...info.data,
          topGainers: topMovers.data.topGainers,
          topLosers: topMovers.data.topLosers,
        },
      },
      revalidate: 300,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        tokens: [],
        pagination: {
          currentPage: 1,
          pageSize: 20,
          totalPages: 0,
          totalCount: 0,
          hasMore: false,
        },
        info: {
          marketcap: { value: 0, change: 0 },
          volume: { value: 0, change: 0 },
          dominance: { btc: 0, eth: 0 },
          fear_and_greed: { value: 0, classification: "Neutral" },
          topGainers: [],
          topLosers: [],
        },
      },
      revalidate: 300,
    };
  }
};

const StyledTrendingContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Home = ({ tokens, pagination, info }: HomeProps) => {
  const [trendingTokens, setTrendingTokens] = useState<Token[]>(
    tokens.slice(0, 5) || []
  );
  const [smallCardInfo, setSmallCardInfo] = useState({
    marketcap: {
      value: info?.marketcap?.value || 0,
      change: info?.marketcap?.change || 0,
    },
    volume: {
      value: tokens.reduce((sum, token) => sum + (token.volume24h || 0), 0),
      change: 0,
    },
    dominance: info?.dominance || { btc: 0, eth: 0 },
    fear_and_greed: info?.fear_and_greed || {
      value: 0,
      classification: "Neutral",
    },
  });

  const [
    tokensWithChartDataAndPredctionData,
    setTokensWithChartDataAndPredictionData,
  ] = useState<Token[]>([]);
  const [hasFetchedData, setHasFetchedData] = useState<boolean>(false);
  const [currentTokens, setCurrentTokens] = useState<Token[]>(tokens);
  const [currentPagination, setCurrentPagination] =
    useState<PaginationData>(pagination);
  const router = useRouter();

  const fetchPageData = useCallback(async () => {
    try {
      const page = router.query.page ? Number(router.query.page) : 1;
      const pageSize = 20;

      const response = await axios.get(getApiUrl(`/coins`), {
        params: { page, pageSize },
      });

      setCurrentTokens(response.data.tokens);
      setCurrentPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching page data:", error);
    }
  }, [router.query.page]);

  useEffect(() => {
    fetchPageData();
  }, [router.query.page, fetchPageData]);

  // Fetch chart and prediction data when currentTokens changes (after page data is fetched)
  useEffect(() => {
    if (currentTokens.length > 0) {
      fetchChartAndPredictionData(currentTokens);
    }
  }, [currentTokens]);

  // ---- BATCH FETCH FUNCTION ----
  const fetchChartAndPredictionData = async (tokens: Token[]) => {
    try {
      console.log('🚀 Starting batch fetch for', tokens.length, 'tokens');
      const coinIds = tokens.map(token => token.cmcId).filter(Boolean);
      
      if (coinIds.length === 0) {
        console.log('❌ No coin IDs found');
        setTokensWithChartDataAndPredictionData(tokens);
        return;
      }

      console.log('📊 Making batch requests for coin IDs:', coinIds.slice(0, 5), '...');
      
      // Make batch requests for charts and predictions simultaneously
      const [chartsResponse, predictionsResponse] = await Promise.all([
        axios.post(getApiUrl('/batch/charts'), {
          coinIds,
          timeRange: '7d'
        }),
        axios.post(getApiUrl('/batch/predictions'), {
          coinIds,
          predictionType: 'threeDay'
        })
      ]);

      console.log('✅ Batch requests completed successfully');
      console.log('📈 Charts response keys:', Object.keys(chartsResponse.data));
      console.log('🔮 Predictions response keys:', Object.keys(predictionsResponse.data));

      const chartsData = chartsResponse.data;
      const predictionsData = predictionsResponse.data;

      // Merge the batch results with token data
      const allResults = tokens.map(token => {
        const coinId = token.cmcId;
        const chartData = chartsData[coinId]?.data || [];
        const predictionData = predictionsData[coinId]?.threeDay || null;

        return {
          ...token,
          lastSevenData: chartData,
          prediction: predictionData,
        };
      });

      console.log('✨ Batch processing complete, setting results for', allResults.length, 'tokens');
      setTokensWithChartDataAndPredictionData(allResults);

      if (typeof window !== "undefined") {
        (window as any).tokensWithChartData = allResults;
        (window as any).tokensWithPredictionData = allResults;
      }
    } catch (error) {
      console.error('❌ Error fetching batch data:', error);
      
      // Fallback to individual requests if batch fails
      console.log('🔄 Falling back to individual requests...');
      await fetchChartAndPredictionDataFallback(tokens);
    }
  };

  // Fallback function for individual requests
  const fetchChartAndPredictionDataFallback = async (tokens: Token[]) => {
    const allResults: Token[] = [];
    const batchSize = 3;

    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (token) => {
          try {
            const id = token.cmcId;

            const [chartRes, predictionRes] = await Promise.all([
              axios.get(getApiUrl(`/coin/chart/${id}?timeRange=7d`)),
              axios.get(getApiUrl(`/coin/prediction/${id}`)),
            ]);

            return {
              ...token,
              lastSevenData: chartRes.data,
              prediction: predictionRes?.data?.predictions?.threeDay,
            };
          } catch (error) {
            console.error(`Error fetching data for token ${token.cmcId}:`, error);
            return {
              ...token,
              lastSevenData: [],
              prediction: null,
            };
          }
        })
      );
      allResults.push(...batchResults);
    }

    setTokensWithChartDataAndPredictionData(allResults);

    if (typeof window !== "undefined") {
      (window as any).tokensWithChartData = allResults;
      (window as any).tokensWithPredictionData = allResults;
    }
  };

  useEffect(() => {
    if (!hasFetchedData) {
      setHasFetchedData(true);
      fetchChartAndPredictionData(currentTokens);
    }
  }, [currentTokens, hasFetchedData]);

  useEffect(() => {
    if (info.topGainers && info.topGainers.length > 0) {
      setTrendingTokens(info.topGainers);
    } else {
      setTrendingTokens(currentTokens.slice(0, 5) || []);
    }

    const totalMarketCap = currentTokens.reduce(
      (sum, token) => sum + (token.marketCap || 0),
      0
    );
    const updatedInfo = {
      marketcap: {
        value:
          info?.marketcap?.value && info?.marketcap?.value > 0
            ? info.marketcap.value
            : totalMarketCap,
        change: info?.marketcap?.change || 0,
      },
      volume: {
        value:
          info?.volume?.value ||
          currentTokens.reduce((sum, token) => sum + (token.volume24h || 0), 0),
        change: info?.volume?.change || 0,
      },
      dominance: info?.dominance || { btc: 0, eth: 0 },
      fear_and_greed: info?.fear_and_greed || {
        value: 0,
        classification: "Neutral",
      },
    };

    setSmallCardInfo(updatedInfo);
  }, [currentTokens, info]);

  const homepageSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DroomDroom",
    url: process.env.NEXT_PUBLIC_DOMAIN || "https://droomdroom.com",
    description:
      "Top cryptocurrency prices and charts, listed by market capitalization. Free access to current and historic data for Bitcoin and thousands of altcoins.",
    image: `${
      process.env.NEXT_PUBLIC_URL || "https://droomdroom.com/price"
    }/HomePageSocialSnippet.png')}`,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${
          process.env.NEXT_PUBLIC_URL || "https://droomdroom.com/price"
        }/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const cryptoDataSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Cryptocurrency Prices, Charts & Market Data",
    description:
      "Top cryptocurrency prices and charts, listed by market capitalization. Free access to current and historic data for Bitcoin and thousands of altcoins.",
    image: `${
      process.env.NEXT_PUBLIC_URL || "https://droomdroom.com/price"
    }/HomePageSocialSnippet.png')}`,
    provider: {
      "@type": "Organization",
      name: "DroomDroom",
      url: process.env.NEXT_PUBLIC_URL || "https://droomdroom.com",
    },
    variableMeasured: [
      "Cryptocurrency Price",
      "Market Cap",
      "Trading Volume",
      "Price Change",
      "Circulating Supply",
      "Prediction",
    ],
    dateModified: new Date().toISOString(),
  };

  return (
    <>
      <SEO 
        title="Crypto Price Predictions, Trend Projections & Market Outlook"
        description="Detailed cryptocurrency price predictions, forecasts & expert insights across short, medium, and long-term horizons to guide your decisions."
        keywords="crypto price predictions, cryptocurrency forecasts, bitcoin predictions, ethereum predictions, crypto market outlook, trend analysis, price projections"
        structuredData={[homepageSchema, cryptoDataSchema]} 
      />
      <div style={{ width: "100%" }}>
        <MarqueeScroll />
        <SectionHeader
          title="Today's Cryptocurrency Price Predictions"
          description=""
          showSearch={true}
        />

        <StyledTrendingContainer>
          {/* <TrendingCard
            tokens={info.topGainers || trendingTokens}
            status="positive"
            title="Top Gainers"
          />
          <TrendingCard
            tokens={info.topLosers || trendingTokens}
            status="negative"
            title="Top Losers"
          /> */}
          <RSICards />
          <SmallCard info={smallCardInfo} />
          <AdCard
            url={"https://sg2025.token2049.com/?promo=DROOMDROOM15"}
            source={`${getPageUrl("/static/ad/light-home-add.png")}`}
            darkSource={`${getPageUrl("/static/ad/dark-home-add.png")}`}
            width={400}
            height={280}
            text={"Ad"}
          />
        </StyledTrendingContainer>

        <HomeTable initialTokens={tokensWithChartDataAndPredctionData} />

        <Pagination
          currentPage={currentPagination.currentPage}
          totalPages={currentPagination.totalPages}
        />
        <MobileAdCard
          url={"https://sg2025.token2049.com/?promo=DROOMDROOM15"}
          source={`${getPageUrl("/static/ad/light-add.png")}`}
          darkSource={`${getPageUrl("/static/ad/dark-add.png")}`}
          text={"Ad"}
        />
      </div>
    </>
  );
};

export default Home;
