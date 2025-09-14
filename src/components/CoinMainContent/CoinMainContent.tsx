import React, { useEffect, useState, useRef, useCallback } from "react";
import { useTheme } from "styled-components";
import CoinTabs from "components/CoinSections/CoinTabs";
import { DescriptionCard } from "components/CoinSections/DescriptionCard";
import { getApiUrl } from "utils/config";
import {
  CoinMainWrapper,
  CoinExhangeTitle,
  ExhangesWrapper,
  AboutWrapper,
  StickyWrapper,
  StyledNav,
  ChartSection,
  FomoTitle,
  NavbarContent,
  FaqQuestion,
  FaqQuestionIconContainer,
} from "./CoinMainContent.styled";
import SimilarCrypto from "components/SimilarCrypto/SimilarCrypto";
import ExchangesTable from "components/pages/exchanges/ExchangesTable/ExchangesTable";
import { useCurrency } from "src/context/CurrencyContext";
import ChartHeader from "../ChartHeader/ChartHeader";
import CryptoChipCard from "components/CryptoChipCard/CryptoChipCard";
import axios from "axios";
import { Button } from "styled/elements/Button";
import FiatCurrency from "components/FiatCurrnency/FiatCurrency";
import CoinAboutFAQ from "../CoinAboutFAQ/CoinAboutFAQ";
import {
  PriceDataTitle,
  PriceDataWrapper,
} from "components/MobileCoin/MobileCoin.styled";
import dynamic from "next/dynamic";
import PredictionCoin from "components/PredictionCoin/PredictionCoin";
import { TrendingDown, TrendingUp, ChevronDown, Clock, MessageSquare, FileText } from "lucide-react";
import CoinChart from "components/CoinChart/CoinChart";
import { TokenDescription , ChartDataPoint } from "types";

const SearchBar = dynamic(() => import("components/SearchBar/SearchBar"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "300px",
        height: "40px",
        background: "#f0f0f0",
        borderRadius: "8px",
      }}
    ></div>
  ),
});




interface CoinProps {
  coin: TokenDescription;
}

interface FAQ {
  id: string;
  order: number;
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

const CoinMainContent = ({ coin }: CoinProps) => {
  const theme = useTheme();
  const {getCurrencySymbol, convertPrice } = useCurrency();

  const navRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const chartSectionRef = useRef<HTMLDivElement>(null);
  const sections = useRef<{ [key: string]: HTMLElement }>({});

  const [isStablecoin, setIsStablecoin] = useState<boolean>(false);
  const [navHeight, setNavHeight] = useState<number>(0);
  const [showNav, setShowNav] = useState<boolean>(false);
  const [isSticky, setIsSticky] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("chart");
  const [mostVisitedCoins, setMostVisitedCoins] = useState<any[]>([]);
  const [globalMarketCoins, setGlobalMarketCoins] = useState<any[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState<boolean>(true);
  const [chartHeight, setChartHeight] = useState(300);
  const [isMobile, setIsMobile] = useState(false);
  const [chartTimeRange, setChartTimeRange] = useState("3m");
  const [faqQuestions, setFaqQuestions] = useState<string[]>([]);
  const [faqsLoading, setFaqsLoading] = useState<boolean>(true);

  const sectionIds = [
    // "chart",
    // "about",
    // "tokenomics",
    // "fomo",
    "prediction",
  ];

  const fetchMostVisitedCoins = async () => {
    try {
      const response = await axios.get(getApiUrl(`/coins`));
      if (response && response.data) {
        setMostVisitedCoins(response.data.tokens.slice(0, 20) ?? []);
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
      setMostVisitedCoins([]);
    }
  };

  const fetchGlobalMarketCoins = async () => {
    try {
      const response = await axios.get(getApiUrl(`/coins`));
      if (response && response.data) {
        setGlobalMarketCoins(response.data.tokens.slice(0, 20) ?? []);
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
      setGlobalMarketCoins([]);
    }
  };

  useEffect(() => {
    fetchMostVisitedCoins();
    fetchGlobalMarketCoins();
  }, []);

  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight);
    }

    const fetchChartData = async () => {
      if (!coin?.cmcId) {
        setIsLoadingChart(false);
        return;
      }

      try {
        setIsLoadingChart(true);
        const response = await fetch(getApiUrl("/coin/chart/" + coin?.cmcId));
        if (!response.ok) throw new Error("Failed to fetch chart data");

        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setIsLoadingChart(false);
      }
    };

    fetchChartData();
  }, [coin?.cmcId]);

  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current && chartSectionRef.current) {
        const mainRect = mainContentRef.current.getBoundingClientRect();
        const chartRect = chartSectionRef.current.getBoundingClientRect();

        setShowNav(mainRect.top <= 0 && chartRect.top <= 60);
        setIsSticky(mainRect.top <= 0 && chartRect.top <= 60);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    sections.current = {
      chart: document.getElementById("chart") as HTMLElement,
      description: document.getElementById("description") as HTMLElement,
      tokenomics: document.getElementById("tokenomics") as HTMLElement,
      fomo: document.getElementById("fomo") as HTMLElement,
      prediction: document.getElementById("prediction") as HTMLElement,
    };

    const handleScroll = () => {
      const scrollPosition =
        window.scrollY + (navRef.current?.offsetHeight || 0);

      const currentSection =
        sectionIds.find((id) => {
          const section = document.getElementById(id);
          if (!section) return false;
          const { offsetTop, offsetHeight } = section;
          return (
            scrollPosition >= offsetTop - 100 &&
            scrollPosition < offsetTop + offsetHeight - 100
          );
        }) || "chart";

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && sectionIds.includes(hash)) {
      setActiveSection(hash);
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      setChartHeight(isMobileView ? 200 : 300);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchChartData = useCallback(
    async (timeRange = chartTimeRange) => {
      setIsLoadingChart(true);
      try {
        const timestamp = new Date().getTime();
        const densityParam =
          timeRange === "1d"
            ? "&interval=5m"
            : timeRange === "7d"
            ? "&interval=30m"
            : timeRange === "30d" || timeRange === "1m"
            ? "&interval=1h"
            : timeRange === "90d" || timeRange === "3m"
            ? "&interval=4h"
            : "&interval=1d";

        const response = await fetch(
          getApiUrl(
            `/coin/chart/${coin?.cmcId}?timeRange=${timeRange}${densityParam}&_t=${timestamp}`
          )
        );
        const data = await response.json();

        if (data && data?.chartData && Array.isArray(data?.chartData)) {
          const processedData = data?.chartData?.map(
            (item: any, index: number) => ({
              timestamp: item.time,
              price: item.price,
              volume: item.volume || Math.random() * 1000000 + 500000,
              percent_change_24h: item.percent_change_24h || 0,
            })
          );
          setChartData(processedData);
        } else if (data && Array.isArray(data)) {
          const processedData = data.map((item: any, index: number) => ({
            timestamp: item.time || item.timestamp || item[0],
            price: item.price || item[1],
            volume: item.volume || Math.random() * 1000000 + 500000,
            percent_change_24h: item.percent_change_24h || 0,
          }));
          setChartData(processedData);
        } else if (data && data?.prices && Array.isArray(data?.prices)) {
          const processedData = data?.prices?.map(
            (item: any, index: number) => ({
              timestamp: item[0],
              price: item[1],
              volume: Math.random() * 1000000 + 500000,
              percent_change_24h: data?.percent_change_24h || 0,
            })
          );
          setChartData(processedData);
        } else {
          console.warn(`Unexpected data format for ${timeRange}:`, data);
          setChartData([]);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setChartData([]);
      } finally {
        setIsLoadingChart(false);
      }
    },
    [coin?.cmcId, chartTimeRange]
  );

  const handleTimeRangeChange = (newTimeRange: string) => {
    setChartTimeRange(newTimeRange);
    fetchChartData(newTimeRange);
  };

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  useEffect(() => {
    if (coin && coin.categories) {
      const isStable = coin.categories.some(
        (category) =>
          category.category?.name?.toLowerCase() === "stablecoin" ||
          category.category?.name?.toLowerCase().includes("stablecoin")
      );
      setIsStablecoin(isStable);
    }
  }, [coin]);

  useEffect(() => {
    let isMounted = true;
    if (!coin.ticker && !coin.cmcId && !coin.id) {
      setFaqsLoading(false);
      return;
    }
    async function fetchFAQs() {
      setFaqsLoading(true);
      let apiFaqs: FAQ[] = [];
      try {
        const identifier = coin.ticker || coin.cmcId || coin.id;
        const response = await fetch(getApiUrl(`/coin/faqs/${identifier}`));
        if (response.ok) {
          const data: FAQResponse = await response.json();
          apiFaqs = data.faqs || [];
        }
      } catch {
        console.error("Error fetching FAQs from API");
      }
      let descriptionFaqs: { q: string; a: string }[] = [];
      try {
        if (coin.description) {
          const desc = JSON.parse(coin.description);
          if (Array.isArray(desc)) descriptionFaqs = desc;
        }
      } catch {
        console.error("Error parsing description FAQs");
      }

      const priceChange = coin?.priceChanges?.day1 || 0;
      const isPositive = priceChange > 0;
      const isNegative = priceChange < 0;
      const isNeutral = priceChange === 0;

      const filteredApiFaqs = apiFaqs.filter((faq) => {
        const question = faq.question.toLowerCase();
        if (
          isPositive &&
          question.includes("why") &&
          question.includes("price") &&
          question.includes("down")
        ) {
          return false;
        }
        if (
          isNegative &&
          question.includes("why") &&
          question.includes("price") &&
          question.includes("up")
        ) {
          return false;
        }
        if (
          isNeutral &&
          question.includes("why") &&
          question.includes("price") &&
          (question.includes("up") || question.includes("down"))
        ) {
          return false;
        }
        return !(
          question.includes("related pages") ||
          question.includes("related articles") ||
          question.includes("crypto wallets")
        );
      });

      const filteredDescFaqs = descriptionFaqs.filter((section) => {
        const question = section.q.toLowerCase();
        if (
          isPositive &&
          question.includes("why") &&
          question.includes("price") &&
          question.includes("down")
        ) {
          return false;
        }
        if (
          isNegative &&
          question.includes("why") &&
          question.includes("price") &&
          question.includes("up")
        ) {
          return false;
        }
        if (
          isNeutral &&
          question.includes("why") &&
          question.includes("price") &&
          (question.includes("up") || question.includes("down"))
        ) {
          return false;
        }
        return !(
          question.includes("related pages") ||
          question.includes("related articles") ||
          question.includes("crypto wallets")
        );
      });

      const combined = new Set<string>();
      filteredApiFaqs.forEach((faq) => combined.add(faq.question));
      filteredDescFaqs.forEach((section) => combined.add(section.q));

      if (isMounted) {
        setFaqQuestions(Array.from(combined).slice(0, 8));
        setFaqsLoading(false);
      }
    }
    fetchFAQs();
    return () => {
      isMounted = false;
    };
  }, [coin.id, coin.ticker, coin.cmcId]);

  const scrollToAbout = () => {
    const about = document.getElementById("about");
    if (about) {
      about.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  function handleSectionHover(section: string) {
    setActiveSection(section);
  }

  const [showCopied, setShowCopied] = useState(false);

  const handleShareClick = (url: string, sectionId?: string) => {
    const tokenSlug =
      coin?.ticker && coin?.name
        ? `${coin.name.toLowerCase().replace(/\s+/g, "-")}-${coin.ticker.toLowerCase()}`
        : url.split("/").pop()?.split("#")[0];
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://droomdroom.com";
    const predictionUrl = `${baseUrl}/${tokenSlug}`;
    const baseShareUrl = sectionId === "prediction" ? predictionUrl : url;
    const shareUrl =
      sectionId && sectionId !== "prediction"
        ? `${baseShareUrl.split("#")[0]}#${sectionId}`
        : baseShareUrl;

    const tweetText = `Check out ${coin?.name} (${coin?.ticker}) on DroomDroom!`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      shareUrl
    )}&text=${encodeURIComponent(tweetText)}`;
    window.open(twitterShareUrl, "_blank");

    navigator.clipboard.writeText(shareUrl);
    setShowCopied(true);
    setTimeout(() => {
      setShowCopied(false);
    }, 2000);
  };

  const getRankBasedDescription = (
    name: string,
    ticker: string,
    rank: number
  ) => {
    if (rank <= 10) {
      return `${name} (${ticker}) is a leading force in the digital asset ecosystem, shaping the future of decentralized finance.`;
    } else if (rank <= 50) {
      return `${name} (${ticker}) stands among the most influential projects in crypto, with a strong market presence and adoption.`;
    } else if (rank <= 100) {
      return `${name} (${ticker}) is a top-ranked digital asset, playing a significant role in the evolving blockchain landscape.`;
    } else if (rank <= 200) {
      return `${name} (${ticker}) is an emerging force in the digital asset ecosystem, steadily gaining traction and recognition.`;
    } else if (rank <= 300) {
      return `${name} (${ticker}) is building momentum in the digital asset space with increasing community support and market activity.`;
    } else if (rank <= 500) {
      return `${name} (${ticker}) is a promising project making strides in adoption, utility, and developer interest.`;
    } else if (rank <= 750) {
      return `${name} (${ticker}) is steadily growing within the crypto market, backed by a focused vision and evolving roadmap.`;
    } else if (rank <= 1000) {
      return `${name} (${ticker}) is gaining attention in the digital asset ecosystem with early signs of strong community engagement.`;
    } else if (rank <= 2000) {
      return `${name} (${ticker}) is a developing project showing potential in its niche within the blockchain space.`;
    } else if (rank <= 3000) {
      return `${name} (${ticker}) is in its growth phase, working to establish its place in the evolving Web3 ecosystem.`;
    } else if (rank <= 4000) {
      return `${name} (${ticker}) is an early-stage crypto project with room to grow and a developing ecosystem.`;
    } else {
      return `${name} (${ticker}) is in its foundational stage, exploring use cases and building initial community traction.`;
    }
  };

  return (
    <CoinMainWrapper>
      <StickyWrapper
        ref={navRef}
        className={`${showNav ? "visible" : ""} ${isSticky ? "sticky" : ""}`}
      >
        <NavbarContent>
          <StyledNav ref={navRef} id="section-nav" sticky={isSticky}>
            <CoinTabs
              activeTab={activeSection}
              setActiveTab={setActiveSection}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                zIndex: 9999,
                width: "300px",
                marginRight: "16px",
                marginLeft: "auto",
                isolation: "isolate",
                overflow: "visible",
              }}
            >
              <SearchBar />
            </div>
          </StyledNav>
        </NavbarContent>
      </StickyWrapper>

      {/* <div
        id="chart"
        style={{
          position: "relative",
          background: theme.colors.cardBackground,
          overflow: "hidden",
        }}
      >
        <ChartHeader
          onTimeRangeChange={handleTimeRangeChange}
          currentTimeRange={chartTimeRange}
          isMobile={isMobile}
        />
        <ChartSection onMouseEnter={() => handleSectionHover("chart")}>
        <CoinChart chartData={ chartData} chartTimeRange={chartTimeRange} isLoadingChart={isLoadingChart}  openingPrice={chartData[0]?.price} convertPrice={convertPrice} getCurrencySymbol={getCurrencySymbol} />
        </ChartSection>
      </div> */}

      {/* <div>
        {faqsLoading ? (
          <FaqShimmer />
        ) : faqQuestions.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              padding: "0px 12px",
              gap: "12px",
            }}
          >
            {faqQuestions.slice(0, 4).map((q, idx) => (
              <FaqQuestion key={idx} onClick={scrollToAbout}>
                <FaqQuestionIconContainer>
                  <FaqQuestionIcon question={q} />
                </FaqQuestionIconContainer>
                <span>{q}</span>
              </FaqQuestion>
            ))}
            {faqQuestions.length > 4 && (
              <FaqQuestion onClick={scrollToAbout}>
                <FaqQuestionIconContainer>
                  <ChevronDown
                    size={20}
                    style={{
                      transition: "all 0.3s ease-in-out",
                      fontWeight: "bold",
                      width: "14px",
                      height: "14px",
                      color: "#9ca3af",
                    }}
                  />
                </FaqQuestionIconContainer>
                <span>See More</span>
              </FaqQuestion>
            )}
          </div>
        ) : null}
      </div> */}

      <PredictionCoin
        coin={coin}
        chartData={chartData}
        chart_height={300}
        activeSection="prediction"
        isStablecoin={isStablecoin}
        handleSectionHover={handleSectionHover}
      />

      {/* <AboutWrapper id="about">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${theme.colors.borderColor}`,
            color: theme.colors.textColor,
            padding: "4px 0px",
          }}
        >
          <FomoTitle>About {coin?.name}</FomoTitle>
          <div style={{ position: "relative" }}>
            <Button
              style={{
                border: `1px solid ${theme.colors.borderColor}`,
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                background: "#3b82f6",
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                textDecoration: "none",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.preventDefault();
                handleShareClick(window.location.href, "about");
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 5.24917 15.0227 5.37061L7.08259 9.84064C6.54303 9.32015 5.8089 9 5 9C3.34315 9 2 10.3431 2 12C2 13.6569 3.34315 15 5 15C5.8089 15 6.54303 14.6798 7.08259 14.1594L15.0227 18.6294C15.0077 18.7508 15 18.8745 15 19C15 20.6569 16.3431 22 18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C17.1911 16 16.457 16.3202 15.9174 16.8406L7.97733 12.3706C7.99232 12.2492 8 12.1255 8 12C8 11.8745 7.99232 11.7508 7.97733 11.6294L15.9174 7.15936C16.457 7.67985 17.1911 8 18 8Z"
                  fill="currentColor"
                />
              </svg>
              &nbsp;
              {showCopied ? "Copied!" : "Share"}
            </Button>
          </div>
        </div>
        <DescriptionCard>
          {coin?.description ? (
            <CoinAboutFAQ coin={coin} />
          ) : (
            <p>
              {getRankBasedDescription(coin?.name, coin?.ticker, coin?.rank!)}
              {coin?.currentPrice?.usd !== undefined
                ? ` The current market valuation places ${coin?.name} at $${
                    typeof coin?.currentPrice?.usd === "number"
                      ? coin?.currentPrice?.usd?.toFixed(2)
                      : coin?.currentPrice?.usd
                  } per token${
                    coin?.priceChanges?.day1 !== undefined
                      ? `, reflecting a ${Math.abs(
                          coin?.priceChanges?.day1
                        ).toFixed(2)}% ${
                          coin?.priceChanges?.day1 > 40
                            ? "significant surge"
                            : coin?.priceChanges?.day1 >= 15
                            ? "whopping increase"
                            : coin?.priceChanges?.day1 >= 5
                            ? "impressive rise"
                            : coin?.priceChanges?.day1 >= 0
                            ? "slight increase"
                            : coin?.priceChanges?.day1 >= -5
                            ? "slight decline"
                            : coin?.priceChanges?.day1 >= -15
                            ? "higher decline"
                            : "significant decline"
                        } in value during the past 24-hour trading period. This price movement indicates ${
                          coin?.priceChanges?.day1 >= 25
                            ? "strong"
                            : coin?.priceChanges?.day1 >= 10
                            ? "growing"
                            : coin?.priceChanges?.day1 >= 0
                            ? "positive"
                            : "slightly negative"
                        } market activity within the ${
                          coin?.ticker ? coin?.ticker?.toUpperCase() : ""
                        } ecosystem.`
                      : "."
                  }`
                : ""}
              {coin?.marketData?.volume24h
                ? ` Investor engagement with ${coin?.name} remains ${
                    Number(coin?.marketData?.volume24h) > 1000000000
                      ? "dominant"
                      : Number(coin?.marketData?.volume24h) > 500000000
                      ? "significant"
                      : Number(coin?.marketData?.volume24h) > 100000000
                      ? "substantial"
                      : Number(coin?.marketData?.volume24h) > 10000000
                      ? "neutral"
                      : "lower"
                  }, with $${Number(
                    coin?.marketData?.volume24h
                  ).toLocaleString()} in trading volume recorded across various trading platforms over the last 24 hours. This level of liquidity highlights ${
                    coin?.ticker ? coin?.ticker?.toUpperCase() : ""
                  }'s ${
                    Number(coin?.marketData?.volume24h) > 1000000000
                      ? "rising"
                      : Number(coin?.marketData?.volume24h) > 500000000
                      ? "substantial"
                      : Number(coin?.marketData?.volume24h) > 100000000
                      ? "ongoing"
                      : Number(coin?.marketData?.volume24h) > 10000000
                      ? "neutral"
                      : "declining"
                  } interest and utility within the broader cryptocurrency landscape`
                : ""}
              {coin?.socials?.website && coin?.socials?.website[0]
                ? ` For comprehensive details regarding ${coin?.name}'s development roadmap, technical specifications, and community initiatives, interested parties are encouraged to visit the project's official resource hub at ${coin?.socials?.website[0]}.`
                : ""}
              {!coin?.marketData?.totalSupply &&
              !coin?.marketData?.circulatingSupply &&
              coin?.currentPrice?.usd === undefined &&
              !coin?.marketData?.volume24h
                ? `Information about ${coin?.name} is currently limited. Please check back later for more details as they become available.`
                : ""}
            </p>
          )}
        </DescriptionCard>
      </AboutWrapper> */}

      <SimilarCrypto coin={coin} />

      {/* <CryptoChipCard heading="Most Visited Coins" coins={mostVisitedCoins} /> */}
      {/* <CryptoChipCard heading="Global Market Coins" coins={globalMarketCoins} /> */}

      {/* <FiatCurrency coin={coin} /> */}

      {/* {coin?.description && (
        <PriceDataWrapper>
          <PriceDataTitle>{coin?.name} Price Live Data</PriceDataTitle>
          <DescriptionCard>
            <p>
              {getRankBasedDescription(coin?.name, coin?.ticker, coin?.rank!)}
              {coin?.currentPrice?.usd !== undefined
                ? ` The current market valuation places ${coin?.name} at $${
                    typeof coin?.currentPrice?.usd === "number"
                      ? coin?.currentPrice?.usd?.toFixed(2)
                      : coin?.currentPrice?.usd
                  } per token${
                    coin?.priceChanges?.day1 !== undefined
                      ? `, reflecting a ${Math.abs(
                          coin?.priceChanges?.day1
                        ).toFixed(2)}% ${
                          coin?.priceChanges?.day1 > 40
                            ? "significant surge"
                            : coin?.priceChanges?.day1 >= 15
                            ? "whopping increase"
                            : coin?.priceChanges?.day1 >= 5
                            ? "impressive rise"
                            : coin?.priceChanges?.day1 >= 0
                            ? "slight increase"
                            : coin?.priceChanges?.day1 >= -5
                            ? "slight decline"
                            : coin?.priceChanges?.day1 >= -15
                            ? "higher decline"
                            : "significant decline"
                        } in value during the past 24-hour trading period. This price movement indicates ${
                          coin?.priceChanges?.day1 >= 25
                            ? "strong"
                            : coin?.priceChanges?.day1 >= 10
                            ? "growing"
                            : coin?.priceChanges?.day1 >= 0
                            ? "positive"
                            : "slightly negative"
                        } market activity within the ${
                          coin?.ticker ? coin?.ticker?.toUpperCase() : ""
                        } ecosystem.`
                      : "."
                  }`
                : ""}
              {coin?.marketData?.volume24h
                ? ` Investor engagement with ${coin?.name} remains ${
                    Number(coin?.marketData?.volume24h) > 1000000000
                      ? "dominant"
                      : Number(coin?.marketData?.volume24h) > 500000000
                      ? "significant"
                      : Number(coin?.marketData?.volume24h) > 100000000
                      ? "substantial"
                      : Number(coin?.marketData?.volume24h) > 10000000
                      ? "neutral"
                      : "lower"
                  }, with $${Number(
                    coin?.marketData?.volume24h
                  ).toLocaleString()} in trading volume recorded across various trading platforms over the last 24 hours. This level of liquidity highlights ${
                    coin?.ticker ? coin?.ticker?.toUpperCase() : ""
                  }'s ${
                    Number(coin?.marketData?.volume24h) > 1000000000
                      ? "rising"
                      : Number(coin?.marketData?.volume24h) > 500000000
                      ? "substantial"
                      : Number(coin?.marketData?.volume24h) > 100000000
                      ? "ongoing"
                      : Number(coin?.marketData?.volume24h) > 10000000
                      ? "neutral"
                      : "declining"
                  } interest and utility within the broader cryptocurrency landscape`
                : ""}
              {coin?.socials?.website && coin?.socials?.website[0]
                ? ` For comprehensive details regarding ${coin?.name}'s development roadmap, technical specifications, and community initiatives, interested parties are encouraged to visit the project's official resource hub at ${coin?.socials?.website[0]}.`
                : ""}
              {!coin?.marketData?.totalSupply &&
              !coin?.marketData?.circulatingSupply &&
              coin?.currentPrice?.usd === undefined &&
              !coin?.marketData?.volume24h
                ? `Information about ${coin?.name} is currently limited. Please check back later for more details as they become available.`
                : ""}
            </p>
          </DescriptionCard>
        </PriceDataWrapper> 
      )} */}
    </CoinMainWrapper>
  );
};

export default CoinMainContent;

const FaqShimmer = () => {
  const theme = useTheme();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        padding: "0px 12px",
        gap: "12px",
        overflow: "hidden",
      }}
    >
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          style={{
            flex: index === 4 ? "0 0 100px" : "1",
            height: "40px",
            background:
              theme.name === "dark"
                ? "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)"
                : "linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)",
            borderRadius: "8px",
            animation: "shimmer 1.5s infinite",
            backgroundSize: "200% 100%",
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

const FaqQuestionIcon = ({ question }: { question: string }) => {
  const iconStyle = {
    transition: "all 0.3s ease-in-out",
    width: "14px",
    height: "14px",
  };

  if (question.toLowerCase().includes("price") && question.toLowerCase().includes("up")) {
    return <TrendingUp size={20} style={{ ...iconStyle, color: "#16c784" }} />;
  }
  if (question.toLowerCase().includes("price") && question.toLowerCase().includes("down")) {
    return <TrendingDown size={20} style={{ ...iconStyle, color: "#F6465D" }} />;
  }
  if (question.toLowerCase().includes("future") || question.toLowerCase().includes("affect")) {
    return <Clock size={20} style={{ ...iconStyle, color: "#a855f7" }} />;
  }
  if (question.toLowerCase().includes("people") || question.toLowerCase().includes("saying")) {
    return <MessageSquare size={20} style={{ ...iconStyle, color: "#3b82f6" }} />;
  }
  if (question.toLowerCase().includes("latest") || question.toLowerCase().includes("news")) {
    return <FileText size={20} style={{ ...iconStyle, color: "#10b981" }} />;
  }
  return <FileText size={20} style={{ ...iconStyle, color: "#9ca3af" }} />;
};