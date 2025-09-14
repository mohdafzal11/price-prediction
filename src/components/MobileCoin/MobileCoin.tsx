import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import styled, { useTheme } from "styled-components";
import CoinTabs from "components/CoinSections/CoinTabs";
import { DescriptionCard } from "components/CoinSections/DescriptionCard";
import { getApiUrl, getPageUrl } from "utils/config";
import PriceDisplay from "components/PriceDisplay/PriceDisplay";
import PercentageChange from "components/PercentageChange/PercentageChange";
import {
  FaGlobe,
  FaFileAlt,
  FaTelegram,
  FaDiscord,
  FaGithub,
  FaReddit,
  FaFacebook,
  FaChevronDown,
  FaExternalLinkAlt,
  FaInfinity,
} from "react-icons/fa";
import { MdSwapVert } from "react-icons/md";
import {
  CoinMainWrapper,
  CoinExhangeTitle,
  ExhangesWrapper,
  LoaderWrapper,
  LoaderContent,
  LoaderShimmer,
  AboutWrapper,
  ChartSection,
  ProgressBar,
  FomoTitle,
  NavbarContent,
  ProgressContainer,
  ChartWrapper,
  CurrencySelectorWrapper,
  PriceDataTitle,
  PriceDataWrapper,
  Header,
} from "./MobileCoin.styled";
import {
  Gauge,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  ExternalLink,
  Heart,
  Repeat,
} from "lucide-react";
import SearchBar from "components/SearchBar/SearchBar";

import ExchangesTable from "components/pages/exchanges/ExchangesTable/ExchangesTable";
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import { CurrencyCode, useCurrency } from "src/context/CurrencyContext";

import {
  StatsGrid,
  StatBox,
  StatLabel,
  StatValue,
  LinksWrapper,
  Links,
  CoinIcon,
  CoinInfo,
  PriceSection,
  PriceHeader,
  PriceWrapper,
  CirculatingSupply,
  LinksRow,
  LinksTitle,
  LinkIcon,
  LinkText,
  CoinConverter,
  ConverterTitle,
  ConvertInput,
  InputField,
  CurrencyLabel,
  NameTickerContainer,
  CoinConverterContainer,
  CoinConverterCard,
  CoinConverterCardTitle,
  CoinConvertInputsWrapper,
  SwapButton,
} from "../../components/pages/coin/CoinLeftSidebar/CoinLeftSidebar.styled";
import CurrencySelector from "components/CurrencySelector/CurrencySelector";
import CryptoSelector from "components/CryptoSelector/CryptoSelector";
import CoinAboutFAQ from "../CoinAboutFAQ/CoinAboutFAQ";

import PriceGuide from "../PriceGuide/PriceGuide";
import ChartHeader from "../ChartHeader/ChartHeader";
import { IconType } from "react-icons";
import { FaXTwitter } from "react-icons/fa6";
import SimilarCrypto from "../SimilarCrypto/SimilarCrypto";
import CryptoChipCard from "components/CryptoChipCard/CryptoChipCard";
import axios from "axios";
import FiatCurrency from "components/FiatCurrnency/FiatCurrency";
import {
  UserAvatar,
  PostHeader,
  PostContent,
  PostCard,
  FeedSection,
  PostTime,
  UserName,
  UserInfo,
  InteractionBar,
  InteractionButton,
  TweetContainer,
  LinkPreviewDomain,
  LinkPreviewDescription,
  LinkPreviewTitle,
  LinkPreviewContent,
  LinkPreview,
  LinkPreviewImage,
  TrendingUpButton,
  TrendingDownButton,
  Buttons,
  VideoPreviewContainer,
} from "components/pages/coin/CoinRightSidebar/CoinRightSidebar.styles";
import PredictionCoin from "components/PredictionCoin/PredictionCoin";
import CustomLink from "components/CustomLink/CustomLink";

interface ChartDataPoint {
  timestamp: string | number;
  price: number;
  volume?: number;
  percent_change_24h?: number;
}

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
    whitepaper: string[];
    reddit: string[];
    facebook: string[];
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

interface CoinProps {
  coin: TokenData;
  topTokens: TokenData[];
}

interface ConvertState {
  fromAmount: string;
  toAmount: string;
  fromCurrency: string;
  toCurrency: string;
}

const CoinMobile = ({ coin, topTokens }: CoinProps) => {
  const theme = useTheme();
  const {
    getCurrencySymbol,
    convertPrice,
    currency,
    rates,
    setCurrency,
  } = useCurrency();
  const price = coin.currentPrice?.usd || 0;

  const navRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const chartSectionRef = useRef<HTMLDivElement>(null);
  const sections = useRef<{ [key: string]: HTMLElement }>({});
  const navContentRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const [isNavContentSticky, setIsNavContentSticky] = useState(false);
  const originalTopRef = useRef<number>(0);
  const navHeightRef = useRef<number>(0);

  // Navigation and UI state
  const [navHeight, setNavHeight] = useState<number>(0);
  const [showNav, setShowNav] = useState<boolean>(false);
  const [isSticky, setIsSticky] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("chart");
  const [cryptoAmount, setCryptoAmount] = React.useState("");
  const [currencyAmount, setCurrencyAmount] = React.useState("");
  const [explorerDropdownOpen, setExplorerDropdownOpen] = React.useState(false);
  const explorerDropdownRef = React.useRef<HTMLDivElement>(null);
  const [mostVisitedCoins, setMostVisitedCoins] = useState<any[]>([]);
  const [globalMarketCoins, setGlobalMarketCoins] = useState<any[]>([]);
  const [tweetLoading, setTweetLoading] = useState(false);
  const [tweets, setTweets] = useState<any[]>([]);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [voteCount, setVoteCount] = useState({
    bullish: 0,
    bearish: 0,
  });
  const [animatedElement, setAnimatedElement] = useState<
    "bullish" | "bearish" | null
  >(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState<boolean>(true);
  const [isStablecoin, setIsStablecoin] = useState(false);
  const [isSwapped, setIsSwapped] = React.useState(false);

  const sectionIds = [
    "chart",
    "about",
    "tokenomics",
    "fomo",
    "prediction",
  ];

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

  const [faqQuestions, setFaqQuestions] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchFAQs() {
      let apiFaqs: FAQ[] = [];
      try {
        const identifier = coin.ticker || coin.cmcId || coin.id;
        const response = await fetch(getApiUrl(`/coin/faqs/${identifier}`));
        if (response.ok) {
          const data: FAQResponse = await response.json();
          apiFaqs = data.faqs || [];
        }
      } catch {
        console.log("Error fetching FAQs");
      }
      let descriptionFaqs: { q: string; a: string }[] = [];
      try {
        if (coin.description) {
          const desc = JSON.parse(coin.description);
          if (Array.isArray(desc)) descriptionFaqs = desc;
        }
      } catch {
        console.log("Error parsing description FAQs");
      }
      const combined: string[] = [];
      if (apiFaqs.length > 0) {
        apiFaqs.forEach((faq) => combined.push(faq.question));
      }
      if (descriptionFaqs.length > 0) {
        descriptionFaqs
          .filter((section) => {
            const q = section.q.toLowerCase();
            return !(
              q.includes("related pages") ||
              q.includes("related articles") ||
              q.includes("crypto wallets")
            );
          })
          .forEach((section) => combined.push(section.q));
      }
      if (isMounted) setFaqQuestions(combined);
    }
    fetchFAQs();
    return () => {
      isMounted = false;
    };
  }, [coin]);

  const scrollToAbout = () => {
    const about = document.getElementById("about");
    if (about) {
      about.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        setTweetLoading(true);
        const response = await fetch(getApiUrl("/tweets"));
        if (!response.ok) {
          throw new Error("Failed to fetch tweets");
        }
        const data = await response.json();
        setTweets(data);
      } catch (error) {
        console.error("Error fetching tweets:", error);
        setTweets([]);
      } finally {
        setTweetLoading(false);
      }
    };

    fetchTweets();
  }, []);

  const handleSectionHover = (sectionId: string): void => {
    if (sections.current[sectionId]) {
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight);
    }

    const fetchChartData = async () => {
      if (!coin.cmcId) {
        setIsLoadingChart(false);
        return;
      }

      try {
        setIsLoadingChart(true);
        const response = await fetch(getApiUrl("/coin/chart/" + coin.cmcId));
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
  }, [coin.cmcId]);

  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current && chartSectionRef.current) {
        const mainRect = mainContentRef.current.getBoundingClientRect();
        const chartRect = chartSectionRef.current.getBoundingClientRect();

        const isInMainContent = mainRect.top <= 0;
        const isInOrBelowChart = chartRect.top <= 60;

        setShowNav(isInMainContent && isInOrBelowChart);
        setIsSticky(isInMainContent && isInOrBelowChart);
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

  const [isMobile, setIsMobile] = useState(true);

  const [sentimentData, setSentimentData] = useState({
    bullishPercent: 15,
    bearishPercent: 85,
    bullishIndicators: 4,
    bearishIndicators: 22,
    lastUpdated: new Date().toISOString(),
    technicalSummary: "bearish",
  });

  useEffect(() => {
    const fetchSentiment = async () => {
      if (!coin.cmcId) return;

      try {
        const response = await fetch(
          getApiUrl(`/coin/sentiment/${coin.cmcId}`)
        );

        if (!response.ok) {
          throw new Error("Failed to fetch sentiment data");
        }

        const data = await response.json();
        setSentimentData(data);
      } catch (error) {
        console.error("Error fetching sentiment data:", error);
      }
    };

    fetchSentiment();
  }, [coin.cmcId]);

  const [chartTimeRange, setChartTimeRange] = useState("3m");

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
            `/coin/chart/${coin.cmcId}?timeRange=${timeRange}${densityParam}&_t=${timestamp}`
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
    [coin.cmcId, chartTimeRange]
  );

  const handleTimeRangeChange = (newTimeRange: string) => {
    if (newTimeRange === chartTimeRange) {
      fetchChartData(newTimeRange);
      return;
    }

    setChartTimeRange(newTimeRange);
    fetchChartData(newTimeRange);
  };

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  useEffect(() => {
    if (navContentRef.current) {
      const rect = navContentRef.current.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      originalTopRef.current = rect.top + scrollTop;
      navHeightRef.current = rect.height;
    }

    let ticking = false;

    const handleNavContentSticky = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset;
          const shouldBeSticky = scrollY >= originalTopRef.current;

          if (isNavContentSticky !== shouldBeSticky) {
            setIsNavContentSticky(shouldBeSticky);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleNavContentSticky);
    handleNavContentSticky();

    return () => {
      window.removeEventListener("scroll", handleNavContentSticky);
    };
  }, []);

  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNavContentSticky(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(observerRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        explorerDropdownRef.current &&
        !explorerDropdownRef.current.contains(event.target as Node)
      ) {
        setExplorerDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [currency, setCryptoAmount, currencyAmount]);

  const handleCryptoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCryptoAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      const usdValue = parseFloat(value) * price;
      const convertedValue = convertPrice(usdValue);
      setCurrencyAmount(convertedValue.toFixed(2));
    } else {
      setCurrencyAmount("");
    }
  };

  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrencyAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      const valueInUsd = parseFloat(value) / rates[currency];
      setCryptoAmount((valueInUsd / price).toFixed(8));
    } else {
      setCryptoAmount("");
    }
  };

  const handleCurrencyChange = (code: string) => {
    const newCurrency = code as CurrencyCode;
    setCurrency(newCurrency);

    if (cryptoAmount && !isNaN(parseFloat(cryptoAmount))) {
      const usdValue = parseFloat(cryptoAmount) * price;
      const newConvertedValue = usdValue * rates[newCurrency];
      setCurrencyAmount(newConvertedValue.toFixed(2));
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num?.toFixed(2);
  };

  const Icon = ({
    icon: IconComponent,
    ...props
  }: { icon: IconType | string } & React.ComponentProps<any>) => {
    if (typeof IconComponent === "string") {
      console.warn(
        `Icon component received string instead of component: ${IconComponent}`
      );
      return null;
    }
    return <IconComponent {...props} />;
  };

  const ColoredIcon = styled(Icon)<{ color: string }>`
    color: ${(props) => props.color};
    transition: all 0.2s ease;
    &:hover {
      opacity: 0.8;
    }
  `;

  const SocialLink = styled(CustomLink)`
    position: relative;
    padding: 3px;
    border-radius: 20px;
    background: ${(props) => props.theme.colors.colorLightNeutral2};
    &:hover {
      background: ${(props) =>
        props.theme.name === "dark" ? "white" : "rgba(0, 0, 0, 0.05)"};
      .social-name {
        display: block;
      }
    }
  `;

  const SocialName = styled.span`
    display: none;
    position: absolute;
    bottom: -24px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    white-space: nowrap;
    background: ${(props) =>
      props.theme.name === "dark"
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)"};
    padding: 4px 8px;
    border-radius: 4px;
  `;

  const DropdownContent = styled.div`
    display: none;
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: ${(props) => props.theme.colors.colorLightNeutral2};
    max-width: 300px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    z-index: 1002;
    padding: 8px 0;
    max-height: 300px;
    overflow-y: auto;
    font-size: 12px;
    border: 1px solid ${(props) => props.theme.colors.borderColor};
    transition: opacity 0.2s ease, transform 0.2s ease;
    transform-origin: top right;

    /* Keep dropdown visible when hovering over it */
    &:hover {
      display: block;
    }
  `;

  const ExplorerDropdown = styled.div`
    position: relative;
    display: inline-block;
    z-index: 1001;

    &:hover ${DropdownContent}, &.active ${DropdownContent} {
      display: block;
      animation: fadeIn 0.2s ease-in-out forwards;
    }

    /* Create a pseudo-element to bridge the gap between the link and dropdown */
    &::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      height: 10px; /* Height of the bridge */
      background: transparent;
      z-index: 1001;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `;

  const DropdownLink = styled.a`
    display: flex;
    align-items: flex-start;
    padding: 10px 12px;
    color: inherit;
    text-decoration: none;
    transition: all 0.2s ease;
    pointer-events: all;
    width: 100%;
    box-sizing: border-box;
    border-bottom: 1px solid ${(props) => props.theme.colors.borderColor};

    &:last-child {
      border-bottom: none;
    }

    span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      padding-right: 16px;
    }

    &:hover {
      background: ${(props) =>
        props.theme.name === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.05)"};
    }
  `;

  const DropdownIndicator = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
    width: 16px;
    height: 16px;
    background: ${(props) => props.theme.colors.colorLightNeutral2};
    border-radius: 50%;
    padding: 2px;
    transition: all 0.2s ease;
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);

    &:hover {
      background: ${(props) => props.theme.colors.colorLightNeutral3};
    }
  `;

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

  const handleConvert = () => {
    const coinName = coin.name.replace(/\s+/g, "-").toLowerCase();
    const coinTicker = coin.ticker.toLowerCase();
    const fiatCurrencyName = CURRENCIES[currency].name
      .toLowerCase()
      .replace(/\s+/g, "-");
    const fiatCurrencySymbol = CURRENCIES[currency].code.toLowerCase();
    window.open(
      `https://droomdroom.com/converter/${coinName}-${coinTicker}/${fiatCurrencyName}-${fiatCurrencySymbol}`,
      "_blank"
    );
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

  const [adImageUrl] = useState("/static/ad/light-add.png");
  const [adDarkImageUrl] = useState("/static/ad/dark-add.png");
  const [adUrl] = useState("https://sg2025.token2049.com/?promo=DROOMDROOM10");

  // Function to save a vote
  const saveVote = useCallback(
    (vote: "bullish" | "bearish") => {
      if (!coin.id) return;

      // Calculate expiry time (midnight UTC)
      const now = new Date();
      const expiry = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1, // Next day
          0,
          0,
          0,
          0 // Midnight
        )
      );

      // Save to localStorage
      const voteKey = `vote_${coin.id}`;
      const voteData = {
        vote,
        expiry: expiry.toISOString(),
      };

      localStorage.setItem(voteKey, JSON.stringify(voteData));
      setUserVote(vote);

      // Update vote count
      setVoteCount((prev) => ({
        ...prev,
        [vote]: prev[vote] + 1,
      }));

      // Optional: Send vote to server
      submitVoteToServer(vote);
    },
    [coin.id]
  );

  const submitVoteToServer = async (vote: string) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(getApiUrl(`/coin/vote/${coin.id}`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vote,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit vote");
      }

      // Optionally update vote counts from server response
      const data = await response.json();
      if (data.voteCount) {
        setVoteCount(data.voteCount);
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      // Vote is still saved locally even if server submission fails
    }
  };

  useEffect(() => {
    if (coin && coin.categories) {
      const isStable = coin.categories.some(
        (category) =>
          category.category?.name?.toLowerCase() === "stablecoin" ||
          category.category?.name.toLowerCase().includes("stablecoin")
      );
      setIsStablecoin(isStable);
    }
  }, [coin]);

  const handleSwap = () => {
    // Toggle the swap state
    setIsSwapped(!isSwapped);

    // If we have a value in the first input, calculate the second input's value
    if (!isSwapped) {
      // First input is crypto, second is currency
      if (cryptoAmount && !isNaN(parseFloat(cryptoAmount))) {
        const usdValue = parseFloat(cryptoAmount) * price;
        const newCurrencyAmount = convertPrice(usdValue).toFixed(2);
        setCurrencyAmount(newCurrencyAmount);
      }
    } else {
      // First input is currency, second is crypto
      if (currencyAmount && !isNaN(parseFloat(currencyAmount))) {
        const valueInUsd = parseFloat(currencyAmount) / rates[currency];
        const newCryptoAmount = (valueInUsd / price).toFixed(8);
        setCryptoAmount(newCryptoAmount);
      }
    }
  };

  return (
    <CoinMainWrapper>
      <div ref={observerRef} style={{ height: "1px", width: "100%" }}></div>
      <NavbarContent
        ref={navContentRef}
        style={{
          position: isNavContentSticky ? "fixed" : "static",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          zIndex: 100,
        }}
      >
        <CoinTabs activeTab={activeSection} setActiveTab={setActiveSection} />
      </NavbarContent>
      {isNavContentSticky && navContentRef.current && (
        <div
          style={{ height: `${navContentRef.current.offsetHeight}px` }}
        ></div>
      )}
      <div style={{ padding: "16px 10px" }}>
        <SearchBar />
      </div>
      <ChartWrapper
        id="chart"
        style={{
          paddingTop: isNavContentSticky
            ? `${navContentRef.current?.offsetHeight}px`
            : 0,
        }}
      >
        <CoinInfo>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CoinIcon>
              <img
                src={
                  coin.cmcId
                    ? `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.cmcId}.png`
                    : "/placeholder.png"
                }
                alt={coin.name}
              />
            </CoinIcon>
            <NameTickerContainer>
              <span>{coin.name}</span>
              <span style={{ opacity: "0.6", fontSize: "16px" }}>
                {coin.ticker}
              </span>
            </NameTickerContainer>
          </div>

          <CurrencySelectorWrapper>
            <CurrencySelector small />
          </CurrencySelectorWrapper>
        </CoinInfo>

        <PriceSection style={{ gridArea: "price" }}>
          <PriceHeader>
            <PriceWrapper>
              <PriceDisplay price={coin?.currentPrice?.usd} />
              <PercentageChange
                value={coin?.priceChanges?.day1 || 0}
                filled
                marginLeft={8}
              />
            </PriceWrapper>
          </PriceHeader>
        </PriceSection>

        <div
          style={{
            position: "relative",
            background: theme.colors.cardBackground,
            overflow: "hidden",
            borderRadius: "12px",
            marginBottom: "16px",
          }}
        >
          <ChartHeader
            onTimeRangeChange={handleTimeRangeChange}
            currentTimeRange={chartTimeRange}
            isMobile={isMobile}
          />
          <ChartSection onMouseEnter={() => handleSectionHover("chart")}>
            <div
              style={{
                position: "relative",
                height: `200px`,
                width: "100%",
                maxWidth: "100vw",
                overflow: "hidden",
                border: `1px solid ${
                  theme.name === "dark" ? "#2D3748" : "#E2E8F0"
                }`,
                borderRadius: "16px",
                padding: "0px 8px",
              }}
            >
              {isLoadingChart ? (
                <ChartLoader />
              ) : chartData.length > 0 ? (
                (() => {
                  const openingPrice = chartData[0]?.price || 0;

                  const createContinuousSegments = () => {
                    const segments: Array<{ data: any[]; isAbove: boolean }> =
                      [];
                    let currentSegment: any[] = [];
                    let isCurrentlyAbove = chartData[0]?.price >= openingPrice;

                    chartData.forEach((point, index) => {
                      const isAbove = point.price >= openingPrice;
                      const enhancedPoint = {
                        ...point,
                        priceVisual: point.price,
                      };

                      if (index === 0) {
                        currentSegment.push(enhancedPoint);
                      } else if (isAbove === isCurrentlyAbove) {
                        currentSegment.push(enhancedPoint);
                      } else {
                        const prevPoint = chartData[index - 1];

                        const intersectionPoint = {
                          ...point,
                          price: openingPrice,
                          priceVisual: openingPrice,
                          timestamp:
                            Number(prevPoint.timestamp) +
                            (Number(point.timestamp) -
                              Number(prevPoint.timestamp)) *
                              0.5,
                          volume:
                            ((prevPoint.volume || 0) + (point.volume || 0)) / 2,
                        };

                        currentSegment.push(intersectionPoint);
                        segments.push({
                          data: [...currentSegment],
                          isAbove: isCurrentlyAbove,
                        });

                        currentSegment = [intersectionPoint, enhancedPoint];
                        isCurrentlyAbove = isAbove;
                      }
                    });

                    if (currentSegment.length > 0) {
                      segments.push({
                        data: currentSegment,
                        isAbove: isCurrentlyAbove,
                      });
                    }

                    return segments;
                  };

                  const colorSegments = createContinuousSegments();

                  const positiveColor = "#00D4AA";
                  const negativeColor = "#F6465D";
                  const gridColor =
                    theme.name === "dark" ? "#3C3C47" : "#E2E8F0";
                  const textColor =
                    theme.name === "dark" ? "#9CA0B0" : "#58667E";
                  const tooltipBg =
                    theme.name === "dark" ? "#1E1E27" : "#FFFFFF";
                  const tooltipBorder =
                    theme.name === "dark" ? "#3C3C47" : "#E2E8F0";
                  const tooltipText =
                    theme.name === "dark" ? "#F7F8FA" : "#1E1E27";

                  return (
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                      key={`chart-${chartTimeRange}`}
                    >
                      <ComposedChart
                        data={chartData}
                        margin={{ top: 15, right: -25, left: 5, bottom: 0 }}
                        syncId="chart"
                      >
                        <defs>
                          <linearGradient
                            id="positiveGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={positiveColor}
                              stopOpacity={0.35}
                            />
                            <stop
                              offset="50%"
                              stopColor={positiveColor}
                              stopOpacity={0.15}
                            />
                            <stop
                              offset="100%"
                              stopColor={positiveColor}
                              stopOpacity={0.03}
                            />
                          </linearGradient>
                          <linearGradient
                            id="negativeGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={negativeColor}
                              stopOpacity={0.35}
                            />
                            <stop
                              offset="50%"
                              stopColor={negativeColor}
                              stopOpacity={0.15}
                            />
                            <stop
                              offset="100%"
                              stopColor={negativeColor}
                              stopOpacity={0.03}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          stroke={theme.name === "dark" ? "#2D3748" : "#E2E8F0"}
                          strokeOpacity={theme.name === "dark" ? 0.5 : 0.6}
                          horizontal={true}
                          vertical={false}
                          strokeWidth={1}
                        />
                        <XAxis
                          dataKey="timestamp"
                          type="number"
                          domain={["dataMin", "dataMax"]}
                          scale="time"
                          axisLine={true}
                          strokeOpacity={theme.name === "dark" ? 0.5 : 0.65}
                          strokeWidth={0.5}
                          tickLine={false}
                          tick={{
                            fill: theme.name === "dark" ? "#A0AEC0" : "#718096",
                            fontSize: 12,
                            fontWeight: 400,
                            fontFamily:
                              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          }}
                          tickFormatter={(timestamp) => {
                            const date = new Date(timestamp);
                            if (chartTimeRange === "1d") {
                              return date.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              });
                            } else if (chartTimeRange === "7d") {
                              return date.toLocaleDateString("en-US", {
                                day: "2-digit",
                                month: "short",
                              });
                            } else {
                              return date.toLocaleDateString("en-US", {
                                day: "2-digit",
                                month: "short",
                                year: "2-digit",
                              });
                            }
                          }}
                          interval="preserveStartEnd"
                          minTickGap={60}
                          tickCount={5}
                        />

                        <YAxis
                          yAxisId="price"
                          orientation="right"
                          axisLine={true}
                          tickLine={false}
                          stopOpacity={theme.name === "dark" ? 0.5 : 0.65}
                          strokeWidth={0.5}
                          tick={{
                            fill: theme.name === "dark" ? "#A0AEC0" : "#718096",
                            fontSize: 12,
                            fontWeight: 400,
                            fontFamily:
                              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          }}
                          domain={["dataMin * 0.995", "dataMax * 1.005"]}
                          tickFormatter={(value) => {
                            try {
                              const numValue = Number(value);
                              if (isNaN(numValue) || numValue <= 0) return "";
                              const converted = convertPrice(numValue);
                              if (converted >= 1e9)
                                return `${(converted / 1e9).toFixed(2)}B`;
                              if (converted >= 1e6)
                                return `${(converted / 1e6).toFixed(2)}M`;
                              if (converted >= 1e3)
                                return `${(converted / 1e3).toFixed(2)}K`;
                              if (converted < 1) return converted.toFixed(6);
                              return converted.toFixed(2);
                            } catch (error) {
                              console.error("Y-axis formatting error:", error);
                              return "";
                            }
                          }}
                          width={80}
                          tickCount={7}
                          type="number"
                          allowDataOverflow={false}
                          scale="linear"
                        />

                        {/* Reference line at opening price */}
                        <ReferenceLine
                          yAxisId="price"
                          y={openingPrice}
                          stroke={theme.name === "dark" ? "#A0AEC0" : "#718096"}
                          strokeWidth={1}
                          strokeDasharray="3 3"
                          isFront={true}
                        />

                        <Tooltip
                          content={({ active, payload, coordinate }) => {
                            if (!active || !payload || !payload.length)
                              return null;

                            const filteredPayload = payload.filter(
                              (item) => item.dataKey !== "priceVisual"
                            );
                            const isRightHalf =
                              coordinate &&
                              coordinate.x > window.innerWidth / 2;

                            return (
                              <div
                                style={{
                                  backgroundColor: tooltipBg,
                                  border: `1px solid ${tooltipBorder}`,
                                  borderRadius: "10px",
                                  boxShadow:
                                    theme.name === "dark"
                                      ? "0 6px 16px rgba(0, 0, 0, 0.5)"
                                      : "0 6px 16px rgba(0, 0, 0, 0.1)",
                                  padding: "12px 16px",
                                  fontSize: "13px",
                                  color: tooltipText,
                                  fontFamily:
                                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                  transform: isRightHalf
                                    ? "translateX(-100%)"
                                    : "translateX(0)",
                                  maxWidth: "200px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <div
                                  style={{
                                    color:
                                      theme.name === "dark"
                                        ? "#A0AEC0"
                                        : "#718096",
                                    fontSize: "12px",
                                    marginBottom: "8px",
                                    fontWeight: 500,
                                  }}
                                >
                                  {new Date(
                                    payload[0].payload.timestamp
                                  ).toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </div>
                                {filteredPayload.map((item, index) => {
                                  if (item.dataKey === "price") {
                                    const converted = convertPrice(
                                      Number(item.value)
                                    );
                                    return (
                                      <div
                                        key={index}
                                        style={{
                                          color: tooltipText,
                                          fontSize: "14px",
                                          fontWeight: 600,
                                          marginBottom: "4px",
                                        }}
                                      >
                                        Price: {getCurrencySymbol()}
                                        {converted.toLocaleString(undefined, {
                                          minimumFractionDigits:
                                            converted < 1 ? 6 : 2,
                                          maximumFractionDigits:
                                            converted < 1 ? 8 : 2,
                                        })}
                                      </div>
                                    );
                                  }
                                  if (item.dataKey === "volume") {
                                    const vol = Number(item.value);
                                    let volumeText = "";
                                    if (vol >= 1e9)
                                      volumeText = `${getCurrencySymbol()}${(
                                        vol / 1e9
                                      ).toFixed(2)}B`;
                                    else if (vol >= 1e6)
                                      volumeText = `${getCurrencySymbol()}${(
                                        vol / 1e6
                                      ).toFixed(2)}M`;
                                    else if (vol >= 1e3)
                                      volumeText = `${getCurrencySymbol()}${(
                                        vol / 1e3
                                      ).toFixed(2)}K`;
                                    else
                                      volumeText = `${getCurrencySymbol()}${vol.toLocaleString()}`;

                                    return (
                                      <div
                                        key={index}
                                        style={{
                                          color: tooltipText,
                                          fontSize: "13px",
                                          fontWeight: 500,
                                        }}
                                      >
                                        Volume: {volumeText}
                                      </div>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            );
                          }}
                          cursor={{
                            stroke:
                              theme.name === "dark" ? "#718096" : "#A0AEC0",
                            strokeWidth: 1,
                            strokeOpacity: 0.8,
                            strokeDasharray: "3 3",
                          }}
                          position={{ y: 20 }}
                        />

                        <Area
                          yAxisId="price"
                          type="linear"
                          dataKey="price"
                          stroke="transparent"
                          fill="transparent"
                          strokeWidth={0}
                          dot={false}
                          activeDot={false}
                          isAnimationActive={false}
                          connectNulls={true}
                        />

                        {colorSegments.map((segment, index) => (
                          <Area
                            key={`segment-${index}`}
                            yAxisId="price"
                            type="linear"
                            data={segment.data}
                            dataKey="priceVisual"
                            stroke={
                              segment.isAbove ? positiveColor : negativeColor
                            }
                            fill={
                              segment.isAbove
                                ? "url(#positiveGradientMobile)"
                                : "url(#negativeGradientMobile)"
                            }
                            strokeWidth={window.innerWidth < 768 ? 1.5 : 2}
                            dot={false}
                            connectNulls={true}
                            activeDot={false}
                            isAnimationActive={false}
                            legendType="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            baseValue={openingPrice}
                          />
                        ))}
                      </ComposedChart>
                    </ResponsiveContainer>
                  );
                })()
              ) : (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#858CA2",
                    fontSize: "12px",
                  }}
                >
                  <p>No chart data available</p>
                </div>
              )}
            </div>
          </ChartSection>
        </div>

        <CoinConverter>
          <ConverterTitle id="converter">
            {coin?.ticker} to Fiat Converter
          </ConverterTitle>
          <CoinConverterContainer>
            <CoinConvertInputsWrapper>
              {isSwapped ? (
                <>
                  <ConvertInput>
                    <CurrencyLabel>{coin?.ticker}</CurrencyLabel>
                    <InputField
                      type="number"
                      value={cryptoAmount}
                      onChange={handleCryptoChange}
                      placeholder="0.00"
                    />
                  </ConvertInput>
                  <SwapButton onClick={handleSwap} type="button">
                    <MdSwapVert />
                  </SwapButton>
                  <ConvertInput>
                    <CryptoSelector
                      selectedCrypto={currency}
                      onSelect={handleCurrencyChange}
                    />
                    <InputField
                      type="number"
                      value={currencyAmount}
                      onChange={handleChangeAmount}
                      placeholder="0.00"
                    />
                  </ConvertInput>
                </>
              ) : (
                <>
                  <ConvertInput>
                    <CryptoSelector
                      selectedCrypto={currency}
                      onSelect={handleCurrencyChange}
                    />
                    <InputField
                      type="number"
                      value={currencyAmount}
                      onChange={handleChangeAmount}
                      placeholder="0.00"
                    />
                  </ConvertInput>
                  <SwapButton onClick={handleSwap} type="button">
                    <MdSwapVert />
                  </SwapButton>
                  <ConvertInput>
                    <CurrencyLabel>{coin?.ticker}</CurrencyLabel>
                    <InputField
                      type="number"
                      value={cryptoAmount}
                      onChange={handleCryptoChange}
                      placeholder="0.00"
                    />
                  </ConvertInput>
                </>
              )}
            </CoinConvertInputsWrapper>
            <CoinConverterCard onClick={handleConvert}>
              <CoinConverterCardTitle>
                {`Converter for ${coin?.name} (${coin?.ticker}) to Any Currency`}{" "}
                <Icon icon={FaExternalLinkAlt} size={12} color="currentColor" />
              </CoinConverterCardTitle>
            </CoinConverterCard>
          </CoinConverterContainer>
        </CoinConverter>

        <ConverterTitle style={{ paddingTop: "20px" }}>
          {" "}
          {coin?.name} Statistics
        </ConverterTitle>

        <StatsGrid>
          <StatBox>
            <StatLabel>Market cap</StatLabel>
            {(coin?.marketData?.marketCap || 0) <= 0 ? (
              <StatValue>
                <Icon icon={FaInfinity} size={16} />
              </StatValue>
            ) : (
              <StatValue>
                {getCurrencySymbol()}
                {formatNumber(convertPrice(coin?.marketData?.marketCap || 0))}
              </StatValue>
            )}
          </StatBox>
          <StatBox>
            <StatLabel>Volume (24h)</StatLabel>
            {(coin?.marketData?.volume24h || 0) <= 0 ? (
              <StatValue>
                <Icon icon={FaInfinity} size={16} />
              </StatValue>
            ) : (
              <StatValue>
                {getCurrencySymbol()}
                {formatNumber(convertPrice(coin?.marketData?.volume24h || 0))}
              </StatValue>
            )}
          </StatBox>
          <StatBox>
            <StatLabel>FDV</StatLabel>
            {(coin?.marketData?.fdv || 0) <= 0 ? (
              <StatValue>
                <Icon icon={FaInfinity} size={16} />
              </StatValue>
            ) : (
              <StatValue>
                {getCurrencySymbol()}
                {formatNumber(convertPrice(coin?.marketData?.fdv || 0))}
              </StatValue>
            )}
          </StatBox>
          <StatBox>
            <StatLabel>Vol/Mkt Cap (24h)</StatLabel>
            {(coin?.marketData?.marketCap || 0) <= 0 ? (
              <StatValue>
                <Icon icon={FaInfinity} size={16} />
              </StatValue>
            ) : (
              <StatValue>
                {(
                  ((coin?.marketData?.volume24h || 0) /
                    (coin?.marketData?.marketCap || 1)) *
                  100
                )?.toFixed(2)}
                %
              </StatValue>
            )}
          </StatBox>
          <StatBox>
            <StatLabel>Total Supply</StatLabel>
            {(coin?.marketData?.totalSupply || 0) <= 0 ? (
              <StatValue>
                <Icon icon={FaInfinity} size={16} />
              </StatValue>
            ) : (
              <StatValue>
                {formatNumber(coin?.marketData?.totalSupply || 0)}{" "}
                {coin?.ticker}
              </StatValue>
            )}
          </StatBox>
          <StatBox>
            <StatLabel>Max Supply</StatLabel>
            {(coin?.marketData?.maxSupply || 0) <= 0 ? (
              <StatValue>
                <Icon icon={FaInfinity} size={16} />
              </StatValue>
            ) : (
              <StatValue>
                {formatNumber(coin?.marketData?.maxSupply || 0)} {coin?.ticker}
              </StatValue>
            )}
          </StatBox>
        </StatsGrid>

        <CirculatingSupply>
          <StatLabel>Circulating Supply</StatLabel>
          {(coin?.marketData?.circulatingSupply || 0) <= 0 ? (
            <StatValue>
              <Icon icon={FaInfinity} size={16} />
            </StatValue>
          ) : (
            <StatValue>
              {formatNumber(coin?.marketData?.circulatingSupply || 0)}{" "}
              {coin?.ticker}
            </StatValue>
          )}
        </CirculatingSupply>

        <LinksWrapper>
          <LinksRow>
            <LinksTitle>Website</LinksTitle>
            <Links>
              {coin?.socials?.website?.[0] && (
                <CustomLink
                  href={coin?.socials?.website?.[0]}
                >
                  <LinkIcon>
                    <Icon icon={FaGlobe} size={12} color="currentColor" />
                  </LinkIcon>
                  <LinkText>
                    {coin?.socials?.website?.[0]?.replace(/^https?:\/\//, "")}
                  </LinkText>
                </CustomLink>
              )}
              {coin?.socials?.whitepaper?.[0] && (
                <CustomLink
                  href={coin?.socials?.whitepaper?.[0]
                  }
                >
                  <LinkIcon>
                    <Icon icon={FaFileAlt} size={12} color="currentColor" />
                  </LinkIcon>
                  <LinkText>Whitepaper</LinkText>
                </CustomLink>
              )}
            </Links>
          </LinksRow>

          <LinksRow>
            <LinksTitle>Socials</LinksTitle>
            <Links>
              {coin?.socials?.twitter?.[0] && (
                <SocialLink
                  href={coin?.socials?.twitter?.[0]}
                >
                  <LinkIcon>
                    <ColoredIcon
                      className="icon"
                      icon={FaXTwitter}
                      size={12}
                      color="#1DA1F2"
                    />
                  </LinkIcon>
                  <SocialName className="social-name">Twitter</SocialName>
                </SocialLink>
              )}
              {coin?.socials?.telegram?.[0] && (
                <SocialLink
                  href={coin?.socials?.telegram?.[0]}
                >
                  <LinkIcon>
                    <ColoredIcon
                      className="icon"
                      icon={FaTelegram}
                      size={12}
                      color="#26A5E4"
                    />
                  </LinkIcon>
                  <SocialName className="social-name">Telegram</SocialName>
                </SocialLink>
              )}
              {coin?.socials?.discord?.[0] && (
                <SocialLink
                  href={coin?.socials?.discord?.[0]}
                >
                  <LinkIcon>
                    <ColoredIcon
                      className="icon"
                      icon={FaDiscord}
                      size={12}
                      color="#5865F2"
                    />
                  </LinkIcon>
                  <SocialName className="social-name">Discord</SocialName>
                </SocialLink>
              )}
              {coin?.socials?.github?.[0] && (
                <SocialLink
                  href={coin?.socials?.github?.[0]}
                >
                  <LinkIcon>
                    <ColoredIcon
                      className="icon"
                      icon={FaGithub}
                      size={12}
                      color="#24292E"
                    />
                  </LinkIcon>
                  <SocialName className="social-name">GitHub</SocialName>
                </SocialLink>
              )}
              {coin?.socials?.reddit?.[0] && (
                <SocialLink
                  href={coin?.socials?.reddit?.[0]}
                >
                  <LinkIcon>
                    <ColoredIcon
                      className="icon"
                      icon={FaReddit}
                      size={12}
                      color="#FF4500"
                    />
                  </LinkIcon>
                  <SocialName className="social-name">Reddit</SocialName>
                </SocialLink>
              )}
              {coin?.socials?.facebook?.[0] && (
                <SocialLink
                    href={coin?.socials?.facebook?.[0]
                  }
                >
                  <LinkIcon>
                    <ColoredIcon
                      className="icon"
                      icon={FaFacebook}
                      size={12}
                      color="#1877F2"
                    />
                  </LinkIcon>
                  <SocialName className="social-name">Facebook</SocialName>
                </SocialLink>
              )}
            </Links>
          </LinksRow>

          <LinksRow>
            <LinksTitle>Explorers</LinksTitle>
            <Links>
              {coin?.socials?.explorer?.length > 0 && (
                <ExplorerDropdown
                  className={`explorer-dropdown ${
                    explorerDropdownOpen ? "active" : ""
                  }`}
                  ref={explorerDropdownRef}
                >
                  <CustomLink
                    onClick={(e) => {
                      if (
                        (coin?.socials?.explorer?.length > 1 &&
                          e.target === e.currentTarget) ||
                        (e.target as HTMLElement).closest(".dropdown-indicator")
                      ) {
                        e.stopPropagation();
                        setExplorerDropdownOpen(!explorerDropdownOpen);
                      } else {
                        e.stopPropagation();
                        window.open(coin?.socials?.explorer?.[0], "_blank");
                      }
                    }}
                    title={coin?.socials?.explorer?.[0]}
                    className="explorer-main-link"
                  >
                    <LinkIcon>
                      <Icon icon={FaGlobe} size={14} color="currentColor" />
                    </LinkIcon>
                    <LinkText
                      style={{
                        maxWidth: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {(() => {
                        // Extract domain name from URL
                        const url = coin?.socials?.explorer?.[0];
                        const domain = url
                          ?.replace(/^https?:\/\//, "")
                          .split("/")[0];

                        // Truncate if too long
                        return domain?.length > 20
                          ? domain?.substring(0, 20) + "..."
                          : domain;
                      })()}
                    </LinkText>
                    {coin?.socials?.explorer?.length > 1 && (
                      <DropdownIndicator className="dropdown-indicator">
                        {explorerDropdownOpen ? (
                          <Icon
                            icon={FaChevronDown}
                            size={10}
                            style={{ transform: "rotate(180deg)" }}
                          />
                        ) : (
                          <Icon icon={FaChevronDown} size={10} />
                        )}
                      </DropdownIndicator>
                    )}
                  </CustomLink>
                  {coin?.socials?.explorer?.length > 1 && (
                    <DropdownContent onClick={(e) => e.stopPropagation()}>
                      {coin?.socials?.explorer?.map(
                        (url: string, index: number) => {
                          // Extract domain name from URL
                          const domain = url
                            ?.replace(/^https?:\/\//, "")
                            .split("/")[0];

                          // Get path for display
                          const path = url?.replace(/^https?:\/\/[^\/]+/, "");
                          const displayPath = path?.length > 0 ? path : "/";

                          return (
                            <DropdownLink
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title={url}
                            >
                              <Icon
                                icon={FaGlobe}
                                size={12}
                                style={{ marginRight: "8px", flexShrink: 0 }}
                              />
                              <span>
                                <strong>
                                  {domain?.length > 20
                                    ? domain?.substring(0, 20) + "..."
                                    : domain}
                                </strong>
                                {displayPath !== "/" && (
                                  <span
                                    style={{
                                      opacity: 0.7,
                                      fontSize: "11px",
                                      display: "block",
                                    }}
                                  >
                                    {displayPath?.length > 25
                                      ? displayPath?.substring(0, 25) + "..."
                                      : displayPath}
                                  </span>
                                )}
                              </span>
                            </DropdownLink>
                          );
                        }
                      )}
                    </DropdownContent>
                  )}
                </ExplorerDropdown>
              )}
            </Links>
          </LinksRow>
        </LinksWrapper>
      </ChartWrapper>

      <div>
        {faqQuestions.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "stretch",
              width: "100%",
              padding: "0px 8px",
              gap: "4px",
            }}
          >
            <button
              onClick={scrollToAbout}
              style={{
                flex: 1,
                background: theme.colors.cardBackground,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.borderColor}`,
                borderRadius: "14px",
                padding: "14px 10px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                transition: "background 0.2s",
                whiteSpace: "normal",
                textAlign: "center",
              }}
            >
              {faqQuestions[0]}
            </button>
            {faqQuestions.length > 1 && (
              <button
                onClick={scrollToAbout}
                style={{
                  flex: "0 0 auto",
                  minWidth: "90px",
                  background: theme.colors.cardBackground,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.borderColor}`,
                  borderRadius: "14px",
                  padding: "14px 10px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "background 0.2s",
                  whiteSpace: "normal",
                  textAlign: "center",
                  gap: "6px",
                }}
              >
                See More
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      <PredictionCoin
        coin={coin}
        chartData={chartData}
        activeSection="prediction"
        isStablecoin={isStablecoin}
        handleSectionHover={handleSectionHover}
        chart_height={300}
      />

      <PriceGuide
        onMouseEnter={() => handleSectionHover("prediction")}
        coinName={coin?.name}
        coinTicker={coin?.ticker}
      />

      <AboutWrapper id="about">
        <FomoTitle>About {coin?.name}</FomoTitle>
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
                          coin?.ticker ? coin?.ticker.toUpperCase() : ""
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
                    coin?.ticker ? coin?.ticker.toUpperCase() : ""
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
      </AboutWrapper>

      <SimilarCrypto coin={coin} />

      {/* <CryptoChipCard heading="Most Visited Coins" coins={mostVisitedCoins} /> */}
      {/* <CryptoChipCard heading="Global Market Coins" coins={globalMarketCoins} /> */}

      {/* <FiatCurrency coin={coin} /> */}

      <PriceDataWrapper>
        <PriceDataTitle>{coin?.name} Price Live Data</PriceDataTitle>
        {coin?.description && (
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
                          coin?.ticker ? coin?.ticker.toUpperCase() : ""
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
                    coin?.ticker ? coin?.ticker.toUpperCase() : ""
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
        )}
      </PriceDataWrapper>

      <Header>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Gauge size={18} style={{ color: "#3861fb" }} />
          <b style={{ fontSize: "16px" }}>Community sentiment</b>
        </span>
      </Header>

      <ProgressContainer>
        <ProgressBar
          style={{
            margin: "8px 0",
            height: "24px",
            borderRadius: "0px",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onMouseEnter={() => !userVote && setAnimatedElement("bullish")}
            onMouseLeave={() => !userVote && setAnimatedElement(null)}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "end",
              justifyContent: "flex-end",
              gap: "2px",
              height: "100%",
            }}
          >
            <TrendingUp
              size={
                userVote === "bullish" || animatedElement === "bullish"
                  ? 32
                  : 20
              }
              style={{
                marginRight: "2px",
                color: "#16c784",
                transition: "all 0.3s ease-in-out",
                fontWeight: "bold",
                width:
                  userVote === "bullish" || animatedElement === "bullish"
                    ? "28px"
                    : "24px",
                height:
                  userVote === "bullish" || animatedElement === "bullish"
                    ? "28px"
                    : "20px",
              }}
            />
            <span
              style={{
                color: "#16c784",
                paddingBottom: "0.5px",
                fontWeight: "bold",
                transition: "all 0.3s ease-in-out",
                fontSize:
                  userVote === "bullish" || animatedElement === "bullish"
                    ? "18px"
                    : "14px",
              }}
            >
              {sentimentData?.bullishPercent}%
            </span>
          </div>

          <div
            onMouseEnter={() => !userVote && setAnimatedElement("bullish")}
            onMouseLeave={() => !userVote && setAnimatedElement(null)}
            style={{
              width: `${sentimentData?.bullishPercent}%`,
              height:
                userVote === "bullish" || animatedElement === "bullish"
                  ? "20px"
                  : "16px",
              marginTop:
                userVote === "bullish" || animatedElement === "bullish"
                  ? "0px"
                  : "6px",
              background: "#16c784",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              paddingLeft: "8px",
              color: "white",
              fontWeight: "bold",
              fontSize:
                userVote === "bullish" || animatedElement === "bullish"
                  ? "16px"
                  : "14px",
              transition: "all 0.3s ease-in-out",
              boxShadow:
                userVote === "bullish" || animatedElement === "bullish"
                  ? "inset 0 0 10px rgba(255,255,255,0.3)"
                  : "none",
              borderRadius: "8px 0 0 8px",
              cursor: "pointer",
            }}
          />

          <div
            onMouseEnter={() => !userVote && setAnimatedElement("bearish")}
            onMouseLeave={() => !userVote && setAnimatedElement(null)}
            style={{
              width: `${sentimentData?.bearishPercent}%`,
              height:
                userVote === "bearish" || animatedElement === "bearish"
                  ? "20px"
                  : "16px",
              marginTop:
                userVote === "bearish" || animatedElement === "bearish"
                  ? "0px"
                  : "6px",
              background: "#ea3943",
              display: "flex",
              alignItems: "end",
              justifyContent: "flex-end",
              paddingRight: "4px",
              color: "white",
              fontWeight: "bold",
              fontSize:
                userVote === "bearish" || animatedElement === "bearish"
                  ? "16px"
                  : "14px",
              transition: "all 0.3s ease-in-out",
              boxShadow:
                userVote === "bearish" || animatedElement === "bearish"
                  ? "inset 0 0 10px rgba(255,255,255,0.3)"
                  : "none",
              borderRadius: "0 8px 8px 0",
              cursor: "pointer",
            }}
          />
          <div
            onMouseEnter={() => !userVote && setAnimatedElement("bearish")}
            onMouseLeave={() => !userVote && setAnimatedElement(null)}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "end",
              justifyContent: "flex-end",
              gap: "2px",
              height: "100%",
            }}
          >
            <span
              style={{
                color: "#ea3943",
                fontWeight: "bold",
                transition: "all 0.3s ease-in-out",
                fontSize:
                  userVote === "bearish" || animatedElement === "bearish"
                    ? "18px"
                    : "14px",
                paddingBottom: "0.5px",
              }}
            >
              {sentimentData?.bearishPercent}%
            </span>
            <TrendingDown
              size={
                userVote === "bearish" || animatedElement === "bearish"
                  ? 32
                  : 20
              }
              style={{
                marginLeft: "2px",
                color: "#ea3943",
                transition: "all 0.3s ease-in-out",
                fontWeight: "bold",
                width:
                  userVote === "bearish" || animatedElement === "bearish"
                    ? "28px"
                    : "24px",
                height:
                  userVote === "bearish" || animatedElement === "bearish"
                    ? "28px"
                    : "20px",
              }}
            />
          </div>
        </ProgressBar>

        {!userVote && (
          <Buttons
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              marginTop: "10px",
            }}
          >
            <TrendingUpButton
              onClick={() => !userVote && saveVote("bullish")}
              disabled={!!userVote}
              $active={userVote === "bullish"}
            >
              <TrendingUp size={userVote === "bullish" ? 20 : 16} />
              Bullish
            </TrendingUpButton>
            <TrendingDownButton
              onClick={() => !userVote && saveVote("bearish")}
              disabled={!!userVote}
              $active={userVote === "bearish"}
            >
              <TrendingDown size={userVote === "bearish" ? 20 : 16} />
              Bearish
            </TrendingDownButton>
          </Buttons>
        )}
      </ProgressContainer>

      <VideoPreviewContainer>
        <div
          style={{
            position: "relative",
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            overflow: "hidden",
          }}
          onClick={() => window.open(adUrl, "_blank")}
        >
          <img
            src={getPageUrl(
              theme.name === "dark" ? adDarkImageUrl : adImageUrl
            )}
            alt="TOKEN2049 Promo Code"
            width="100%"
            height="100%"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "fill",
            }}
            loading="eager"
            decoding="async"
            data-error-handled="true"
            data-lcp-element="false"
          />
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
              color: "#e0e0e0",
              background: "rgba(0, 0, 0, 0.5)",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "0.8rem",
              textAlign: "right",
            }}
          >
            Ad
          </div>
        </div>
      </VideoPreviewContainer>

      <FeedSection>
        {tweetLoading ? (
          <PostCard>
            <PostContent>Loading tweets...</PostContent>
          </PostCard>
        ) : tweets && tweets.length > 0 ? (
          tweets.slice(0, 5).map((tweet: any, index: number) => (
            <PostCard key={index}>
              <PostHeader>
                <UserAvatar>
                  <img
                    src={
                      tweet.profile_image ||
                      "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
                    }
                    alt="DroomDroom"
                  />
                </UserAvatar>
                <UserInfo>
                  <UserName>
                    DroomDroom <span>✓</span>
                  </UserName>
                  <PostTime>
                    {tweet.time
                      ? new Date(tweet.time).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recently"}
                  </PostTime>
                </UserInfo>
                {tweet.profile_link && (
                  <a
                    href={`https://x.com/droomdroom/status/${tweet.tweet_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: "auto" }}
                    aria-label={`View tweet on X.com from ${
                      tweet.username || "DroomDroom"
                    }`}
                    title={`View tweet on X.com from ${
                      tweet.username || "DroomDroom"
                    }`}
                  >
                    <ExternalLink size={14} aria-hidden="true" />
                    <span className="sr-only">View on X.com</span>
                  </a>
                )}
              </PostHeader>

              <PostContent>
                {tweet.text && <HyperlinkText text={tweet.text} />}
              </PostContent>

              <InteractionBar>
                <InteractionButton>
                  <Heart size={14} /> <span>{tweet.likes || 0}</span>
                </InteractionButton>
                <InteractionButton>
                  <MessageCircle size={14} /> <span>{tweet.replies || 0}</span>
                </InteractionButton>
                <InteractionButton>
                  <Repeat size={14} /> <span>{tweet.retweets || 0}</span>
                </InteractionButton>
              </InteractionBar>
            </PostCard>
          ))
        ) : (
          <PostCard>
            <PostContent>
              No tweets available at the moment. Check back later!
            </PostContent>
          </PostCard>
        )}
      </FeedSection>
    </CoinMainWrapper>
  );
};

export default CoinMobile;

const formatValue = (value?: number) => {
  if (!value) return "N/A";
  if (value >= 1e12) return (value / 1e12).toFixed(1) + "T";
  if (value >= 1e9) return (value / 1e9).toFixed(1) + "B";
  if (value >= 1e6) return (value / 1e6).toFixed(1) + "M";
  if (value >= 1e3) return (value / 1e3).toFixed(1) + "K";
  return value.toLocaleString();
};

const ComponentLoader = () => (
  <LoaderWrapper>
    <LoaderContent>
      <LoaderShimmer />
    </LoaderContent>
  </LoaderWrapper>
);

const ChartLoader = () => {
  const theme = useTheme();
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          border: `3px solid ${
            theme.name === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)"
          }`,
          borderTop: `3px solid ${theme.colors.textColor}`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "20px",
        }}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `,
        }}
      />
      <div
        style={{
          color: theme.name === "dark" ? "#858CA2" : "#666666",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        Loading chart data...
      </div>
    </div>
  );
};

// Component to render hyperlinked text with URL previews
const HyperlinkText = ({ text }: { text: string }) => {
  // Extract URLs from the text
  const urls = extractUrls(text);
  // Get the first URL for preview
  const firstUrl = urls.length > 0 ? urls[0] : null;

  // Replace URLs with hyperlinks, with special handling for droomdroom.com URLs
  let processedText = text;
  urls.forEach((url) => {
    const isDroomDroom = isDroomDroomUrl(url);
    const linkClass = isDroomDroom ? "droomdroom-link" : "";

    // Create a more user-friendly display text for the URL
    let displayUrl = url;
    try {
      const urlObj = new URL(url);
      // For DroomDroom URLs, highlight them differently
      if (isDroomDroom) {
        displayUrl = `DroomDroom: ${urlObj.pathname.substring(1)}`;
      } else {
        // For other URLs, show domain + truncated path
        const path =
          urlObj.pathname.length > 15
            ? urlObj.pathname.substring(0, 15) + "..."
            : urlObj.pathname;
        displayUrl = `${urlObj.hostname}${path}`;
      }
    } catch (e) {
      // If URL parsing fails, just use the original URL
      console.error("Error parsing URL:", e);
    }

    processedText = processedText.replace(
      url,
      `<a href="${url}" target="_blank" rel="noopener noreferrer" class="${linkClass}">${displayUrl}</a>`
    );
  });

  return (
    <TweetContainer>
      <div dangerouslySetInnerHTML={{ __html: processedText }} />

      {firstUrl && <LinkPreviewComponent url={firstUrl} />}
    </TweetContainer>
  );
};

// Function to create link preview metadata
interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  url: string;
  domain: string;
}

// Function to extract URLs from text
const extractUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

// Function to check if a URL is from droomdroom.com
const isDroomDroomUrl = (url: string): boolean => {
  return url.includes("droomdroom.com");
};

// Function to fetch metadata from our API endpoint
const fetchUrlMetadata = async (url: string): Promise<LinkMetadata> => {
  try {
    // Encode the URL to make it safe for passing as a query parameter
    const encodedUrl = encodeURIComponent(url);
    const response = await fetch(`${getApiUrl(`/metadata?url=${encodedUrl}`)}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }

    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error("Error fetching URL metadata:", error);

    // Fallback to default metadata if the API call fails
    const domain = new URL(url).hostname;
    return {
      title: isDroomDroomUrl(url) ? "DroomDroom Content" : "Web Content",
      description: "Visit this link to learn more.",
      image: isDroomDroomUrl(url)
        ? "https://s2.coinmarketcap.com/static/cloud/img/coin-default.png"
        : "https://via.placeholder.com/800x400?text=Web+Content",
      url: url,
      domain: domain,
    };
  }
};

// Cache for metadata to avoid redundant API calls
const metadataCache: Record<string, LinkMetadata> = {};
// Component to render link preview
const LinkPreviewComponent = ({ url }: { url: string }) => {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadMetadata = async () => {
      setIsLoading(true);

      // Check if we already have this URL's metadata in cache
      if (metadataCache[url]) {
        if (isMounted) {
          setMetadata(metadataCache[url]);
          setIsLoading(false);
        }
        return;
      }

      try {
        // Fetch metadata from our API
        const data = await fetchUrlMetadata(url);

        metadataCache[url] = data;

        if (isMounted) {
          setMetadata(data);
        }
      } catch (error) {
        console.error("Error loading metadata:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMetadata();

    return () => {
      isMounted = false;
    };
  }, [url]);

  if (isLoading) {
    return (
      <LinkPreview as="div">
        <LinkPreviewContent>
          <LinkPreviewTitle>Loading link preview...</LinkPreviewTitle>
        </LinkPreviewContent>
      </LinkPreview>
    );
  }

  // If we failed to load metadata
  if (!metadata) {
    return null;
  }

  return (
    <LinkPreview href={url} target="_blank" rel="noopener noreferrer">
      {metadata.image && (
        <LinkPreviewImage
          style={{ backgroundImage: `url(${metadata.image})` }}
        />
      )}
      <LinkPreviewContent>
        <LinkPreviewTitle>{metadata.title}</LinkPreviewTitle>
        <LinkPreviewDescription>{metadata.description}</LinkPreviewDescription>
        <LinkPreviewDomain>{metadata.domain}</LinkPreviewDomain>
      </LinkPreviewContent>
    </LinkPreview>
  );
};
