import React, { useEffect, useState, useRef, useMemo } from "react";
import { useTheme } from "styled-components";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { DescriptionCard } from "components/CoinSections/DescriptionCard";
import {
  PredictionWrapper,
  PredictionTitle,
  PredictionHeading,
  PredictionButtons,
  GridButton,
  PredictionButtonGrid,
  GridButtonLabel,
  GridButtonValue,
  PredictionPriceGrid,
  GridPrice,
  GridPriceLabel,
  GridPriceValue,
  GridPriceRow,
  PredictionDescription,
  PurchasePredictionWrapper,
  PredictionInputsGrid,
  PredictionInput,
  DateInput,
  PredictionResult,
  BuyNowButton,
  PredictionSummary,
  PredictionDisclaimer,
  PriceTargetsHeader,
  ActionButton,
  BullishSpan,
  AnalysisText,
  LeftSection,
  BearishSpan,
  ProgressContainer,
  RightSection,
  BearishLabel,
  BullishLabel,
  ProgressLabels,
  TechnicalContent,
  MarketStatsTable,
  MarketStatsTitle,
  MarketStatsRow,
  MarketStatsLabel,
  MarketStatsValue,
  CoinPredictionWrapper,
} from "./PredictionCoin.styled";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine,
  TooltipProps,
} from "recharts";
import PriceTargetsTable from "components/PriceTargetsTable/PriceTargetsTable";
import {
  MonthlyPredictionWrapper,
  MonthlyPredictionCard,
  MonthlyPredictionTitle,
  MonthlyPredictionDescription,
  MonthlyPredictionFooter,
  PotentialROI,
  TechnicalsWrapper,
  SentimentRow,
  SentimentLabel,
  SentimentValue,
  ProgressBar,
  BullishBar,
  BearishBar,
  UpdateText,
  TechnicalTitle,
} from "./PredictionCoin.styled";
import PriceGuide from "../PriceGuide/PriceGuide";
import FAQ from "../FAQ/FAQ";
import { getApiUrl } from "utils/config";
import { useCurrency } from "src/context/CurrencyContext";
import CustomLink from "components/CustomLink/CustomLink";

const formatNumber = (value: number): string => {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  if (value < 0.01) return value.toExponential(2);
  return value.toLocaleString(undefined, {
    minimumFractionDigits: value < 1 ? 2 : 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  });
};

interface PredictionResult {
  confidence: number;
  maxPrice: number;
  minPrice: number;
  price: number;
  roi: number;
  sentiment: string;
}

interface PriceTargetData {
  id: string | number;
  date: string;
  prediction: {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  minPrice?: {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  maxPrice?: {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  roi: string;
  actions?: string;
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

interface PredictionChartPoint {
  time: number;
  price: number;
  isHistorical?: boolean;
  isTick?: boolean;
  isMain?: boolean;
  isMin?: boolean;
  isMax?: boolean;
  isBridge?: boolean;
}

interface ColorSegment {
  data: PredictionChartPoint[];
  isAbove: boolean;
}

interface PredictionCoinProps {
  coin: TokenData;
  activeSection: string;
  chart_height: number;
  isStablecoin: boolean;
  chartData: any[];
  handleSectionHover: (section: string) => void;
}

const PredictionCoin = ({
  coin,
  activeSection,
  isStablecoin,
  handleSectionHover,
  chart_height,
  chartData,
}: PredictionCoinProps) => {
  const theme = useTheme();
  const [activePredictionPeriod, setActivePredictionPeriod] =
    useState<string>("threeMonth");
  const [predictionChart, setPredictionChart] = useState<
    Array<PredictionChartPoint>
  >([]);
  const [yearlyPredictions, setYearlyPredictions] = useState<{
    [year: number]: any[];
  }>({});
  const [predictions, setPredictions] = useState<{
    fiveDay: PredictionResult | null;
    oneMonth: PredictionResult | null;
    threeMonth: PredictionResult | null;
    sixMonth: PredictionResult | null;
    oneYear: PredictionResult | null;
  }>({
    fiveDay: null,
    oneMonth: null,
    threeMonth: null,
    sixMonth: null,
    oneYear: null,
  });
  const rawPredictionData = useRef<any>(null);
  const [isLoadingPredictions, setIsLoadingPredictions] =
    useState<boolean>(true);
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000.0);
  const [predictionResult, setPredictionResult] = useState<number>(0);
  const [predictionROI, setPredictionROI] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  );
  const [showCopied, setShowCopied] = useState(false);
  const [sentimentData, setSentimentData] = useState({
    bullishPercent: 15,
    bearishPercent: 85,
    bullishIndicators: 4,
    bearishIndicators: 22,
    lastUpdated: new Date().toISOString(),
    technicalSummary: "bearish",
  });
  const [technicalIndicators, setTechnicalIndicators] = useState<any>(null);
  const { formatPrice, getCurrencySymbol, convertPrice } = useCurrency();
  const [activePoint, setActivePoint] = useState<PredictionChartPoint | null>(
    null
  );

  let currentYear = new Date().getFullYear();
  let thirtyFiveYearsLater = currentYear + 30;
  const yearOptions: number[] = (() => {
    const options: number[] = [];
    for (let year = currentYear; year <= thirtyFiveYearsLater; year++) {
      options.push(year);
    }
    return options;
  })();

  const [selectedYear, setSelectedYear] = useState<number>(
    yearOptions[0] ?? new Date().getFullYear()
  );

  const getVisibleYears = (
    allYears: number[],
    selectedYear: number
  ): (number | string)[] => {
    const result: (number | string)[] = [];
    const nearbyYearCount = 3;
    const endYearCount = 2;

    const firstYears = allYears.slice(0, endYearCount);
    firstYears.forEach((year) => result.push(year));

    const selectedYearIndex = allYears.indexOf(selectedYear);
    const nearbyStartIndex = Math.max(
      endYearCount,
      selectedYearIndex - nearbyYearCount
    );

    if (nearbyStartIndex > endYearCount) {
      result.push("...");
    }

    const nearbyEndIndex = Math.min(
      allYears.length - endYearCount,
      selectedYearIndex + nearbyYearCount + 1
    );
    for (let i = nearbyStartIndex; i < nearbyEndIndex; i++) {
      if (!firstYears.includes(allYears[i])) {
        result.push(allYears[i]);
      }
    }

    if (nearbyEndIndex < allYears.length - endYearCount) {
      result.push("...");
    }

    const lastYears = allYears.slice(allYears.length - endYearCount);
    lastYears.forEach((year) => {
      if (!result.includes(year)) {
        result.push(year);
      }
    });

    return result;
  };

  useEffect(() => {
    calculatePrediction(investmentAmount, selectedDate);
  }, [investmentAmount, selectedDate, coin?.currentPrice?.usd]);

  const handleInvestmentChange = (investAmount: number) => {
    setInvestmentAmount(investAmount);
    calculatePrediction(investAmount, selectedDate);
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getLatestPredictionYear = () => {
    if (!yearlyPredictions) return 2030;
    const years = Object.keys(yearlyPredictions)
      .map((year) => parseInt(year))
      .filter((year) => !isNaN(year))
      .sort((a, b) => a - b);
    return years.length > 0 ? years[years.length - 1] : 2030;
  };

  const priceTargetsColumns = [
    { id: "date", label: "Date", width: "20%" },
    { id: "prediction", label: "Prediction", width: "20%" },
    { id: "roi", label: "Potential ROI", width: "20%" },
    { id: "actions", label: "", width: "120px" },
  ];

  const longTermPredictionColumns = [
    { id: "date", label: "Month", width: "20%" },
    { id: "minPrice", label: "Min. Price", width: "20%" },
    { id: "prediction", label: "Avg. Price", width: "20%" },
    { id: "maxPrice", label: "Max. Price", width: "20%" },
    { id: "roi", label: "Potential ROI", width: "20%" },
    { id: "actions", label: "", width: "120px" },
  ];

  const formatPredictionData = (yearData: any[]): PriceTargetData[] => {
    if (!yearData || yearData?.length === 0) {
      return [];
    }

    return yearData?.map((prediction: any, index: number) => {
      const price = isNaN(prediction.price) ? 0 : prediction.price;
      const minPrice = isNaN(prediction.minPrice)
        ? price * 0.9
        : prediction.minPrice;
      const maxPrice = isNaN(prediction.maxPrice)
        ? price * 1.1
        : prediction.maxPrice;
      const roi = isNaN(prediction.roi) ? 0 : prediction.roi;

      return {
        id: index,
        date: `${prediction.month} ${prediction.year}`,
        prediction: {
          value: `$${Number.isFinite(price) ? price.toFixed(6) : "0.000000"}`,
          trend: roi > 0 ? ("up" as const) : ("down" as const),
        },
        minPrice: {
          value: `$${
            Number.isFinite(minPrice) ? minPrice.toFixed(6) : "0.000000"
          }`,
          trend: "neutral" as const,
        },
        maxPrice: {
          value: `$${
            Number.isFinite(maxPrice) ? maxPrice.toFixed(6) : "0.000000"
          }`,
          trend: "neutral" as const,
        },
        roi: `${roi > 0 ? "+" : ""}${
          Number.isFinite(roi) ? roi.toFixed(2) : "0.00"
        }%`,
        sentiment: prediction?.sentiment || "Neutral",
      };
    });
  };

const getLongTermSummary = (year: number): string => {
  const data = yearlyPredictions[year] ?? [];
  if (!data || !data.length) {
    return ``;
  }

  const validMinPrices = data
    .map((item: any) =>
      !isNaN(parseFloat(item.minPrice)) ? parseFloat(item.minPrice) : null
    )
    .filter((price: number | null) => price !== null && price > 0) as number[];

  const validMaxPrices = data
    .map((item: any) =>
      !isNaN(parseFloat(item.maxPrice)) ? parseFloat(item.maxPrice) : null
    )
    .filter((price: number | null) => price !== null && price > 0) as number[];

  const minPrice = validMinPrices.length > 0 ? Math.min(...validMinPrices) : 0;
  const maxPrice = validMaxPrices.length > 0 ? Math.max(...validMaxPrices) : 0;

  const validPrices = data
    .map((item: any) =>
      !isNaN(parseFloat(item.price)) ? parseFloat(item.price) : null
    )
    .filter((price: number | null) => price !== null && price > 0) as number[];

  const avgOfAvgs =
    validPrices.length > 0
      ? validPrices.reduce((sum: number, price: number) => sum + price, 0) /
        validPrices.length
      : 0;

  const firstMonth = data[0];
  let firstMonthRoi = "0%";

  if (firstMonth && !isNaN(parseFloat(String(firstMonth.roi)))) {
    const roiValue = parseFloat(String(firstMonth.roi));
    firstMonthRoi = `${roiValue > 0 ? "+" : ""}${roiValue.toFixed(2)}%`;
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const timeframeText = year === currentYear ? "remainder of" : "";

  let potentialReturnText = "";
  const roiValue = parseFloat(firstMonthRoi.replace("%", "").replace("+", ""));

  if (!isNaN(roiValue) && roiValue > 0) {
    potentialReturnText = "positive potential return";
  } else {
    potentialReturnText = "negative potential return";
  }

  return `In ${timeframeText} ${year}, ${coin.name} (${
    coin.ticker
  }) is anticipated to change hands in a trading channel between $${minPrice.toFixed(
    6
  )} and $${maxPrice.toFixed(
    6
  )}, leading to an average annualized price of $${avgOfAvgs.toFixed(
    6
  )}. This could result in a ${potentialReturnText} on investment of ${firstMonthRoi} compared to the current rates.`;
};

  useEffect(() => {
  console.log("Coin" , coin)
  const fetchPredictions = async () => {
    if (!coin?.cmcId) {
      setIsLoadingPredictions(false);
      return;
    }
    try {
      setIsLoadingPredictions(true);
      const response = await fetch(getApiUrl(`/coin/all-prediction/${coin?.cmcId}`));

      if (!response.ok) {
        throw new Error("Failed to fetch predictions");
      }

      const data = await response.json();
      console.log("API Response for yearlyPredictions:", data?.yearlyPredictions); // Debug API response

      const predictionData = {
        fiveDay: data.predictions?.fiveDay || null,
        oneMonth: data.predictions?.oneMonth || null,
        threeMonth: data.predictions?.threeMonth || null,
        sixMonth: data.predictions?.sixMonth || null,
        oneYear: data.predictions?.oneYear || null,
      };

      setPredictions(predictionData);
      setYearlyPredictions(data?.yearlyPredictions || {});
      setTechnicalIndicators(data?.technicalIndicators || null);
      setPredictionChart(data?.chartData || []);

      const years = Object.keys(data?.yearlyPredictions || {})
        .map((year) => parseInt(year))
        .filter((year) => !isNaN(year) && data?.yearlyPredictions[year]?.length > 0)
        .sort((a, b) => a - b);
      if (years.length > 0) {
        setSelectedYear(years[0]);
      } else {
        setSelectedYear(new Date().getFullYear());
      }
    } catch (error) {
      console.error("Error fetching predictions:", error);
      setYearlyPredictions({});
      setSelectedYear(new Date().getFullYear());
    } finally {
      setIsLoadingPredictions(false);
    }
  };

  fetchPredictions();
}, [coin?.cmcId, coin?.currentPrice?.usd]);

  const renderArrow = (isUp: boolean) => {
    const style = {
      color: isUp ? "#58bd7d" : "#ea3943",
      fontSize: "14px",
      fontWeight: "bold",
    };
    return <span style={style}>{isUp ? "↑" : "↓"}</span>;
  };

  const handleShareClick = (url: string, sectionId?: string) => {
    const tokenSlug =
      coin?.ticker && coin?.name
        ? `${coin.name
            .toLowerCase()
            .replace(/\s+/g, "-")}-${coin.ticker.toLowerCase()}`
        : url.split("/").pop()?.split("#")[0];

    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://droomdroom.com";
    const predictionUrl = `${baseUrl}/prediction/${tokenSlug}`;
    const shareUrl = sectionId
      ? `${predictionUrl}#${sectionId}`
      : predictionUrl;

    const tweetText = `Check out ${coin?.name} (${
      coin?.ticker
    }) price prediction analysis for 2025-${getLatestPredictionYear()} on DroomDroom!`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      shareUrl
    )}&text=${encodeURIComponent(tweetText)}`;

    console.log(`Sharing prediction URL: ${shareUrl}`);
    window.open(twitterShareUrl, "_blank", "width=550,height=420");
    navigator.clipboard.writeText(shareUrl);
    setShowCopied(true);

    setTimeout(() => {
      setShowCopied(false);
    }, 2000);
  };

  const isPredictionHigher = (predictionPrice: number) => {
    if (!coin?.currentPrice?.usd || !predictionPrice) return true;
    return predictionPrice > coin.currentPrice.usd;
  };

  const faqPredictionData = {
    currentPrice: coin?.currentPrice?.usd || 0,
    fiveDay: predictions?.fiveDay || {
      price: 0,
      minPrice: 0,
      maxPrice: 0,
      roi: 0,
      confidence: 0,
      sentiment: "neutral",
    },
    oneMonth: predictions?.oneMonth || {
      price: 0,
      minPrice: 0,
      maxPrice: 0,
      roi: 0,
      confidence: 0,
      sentiment: "neutral",
    },
    threeMonth: predictions?.threeMonth || {
      price: 0,
      minPrice: 0,
      maxPrice: 0,
      roi: 0,
      confidence: 0,
      sentiment: "neutral",
    },
    sixMonth: predictions?.sixMonth || {
      price: 0,
      minPrice: 0,
      maxPrice: 0,
      roi: 0,
      confidence: 0,
      sentiment: "neutral",
    },
    oneYear: predictions?.oneYear || {
      price: 0,
      minPrice: 0,
      maxPrice: 0,
      roi: 0,
      confidence: 0,
      sentiment: "neutral",
    },
    yearlyPredictions: yearlyPredictions,
    ...(technicalIndicators?.current?.technicalIndicators || {}),
    rawPredictionData: rawPredictionData?.current,
  };

  // Memoize processed chart data to optimize performance
  const processedData = useMemo(() => {
    if (!predictionChart || predictionChart.length === 0) return [];
    const maxPoints = 800;
    const step = Math.max(1, Math.ceil(predictionChart.length / maxPoints));
    return predictionChart
      .filter((_, index) => index % step === 0)
      .map((item) => ({
        ...item,
        priceVisual: item.price,
      }));
  }, [predictionChart]);

  // Determine opening price (first historical data point)
  const openingPrice = useMemo(() => {
    const firstHistoricalPoint = processedData.find(
      (point) => point.isHistorical && !point.isBridge
    );
    return firstHistoricalPoint
      ? firstHistoricalPoint.price
      : coin?.currentPrice?.usd || 0;
  }, [processedData, coin?.currentPrice?.usd]);

  // Create continuous segments for historical data
  const historicalColorSegments = useMemo(() => {
    const segments: ColorSegment[] = [];
    let currentSegment: PredictionChartPoint[] = [];
    const historicalData = processedData.filter(
      (point) => point.isHistorical && !point.isBridge
    );
    if (historicalData.length === 0) return [];

    let isCurrentlyAbove = historicalData[0].price >= openingPrice;

    historicalData.forEach((point, index) => {
      const isAbove = point.price >= openingPrice;
      const enhancedPoint = { ...point };

      if (index === 0) {
        currentSegment.push(enhancedPoint);
      } else if (isAbove === isCurrentlyAbove) {
        currentSegment.push(enhancedPoint);
      } else {
        const prevPoint = historicalData[index - 1];
        const intersectionPoint = {
          ...point,
          price: openingPrice,
          priceVisual: openingPrice,
          time:
            Number(prevPoint.time) +
            (Number(point.time) - Number(prevPoint.time)) * 0.5,
          isHistorical: true,
          isTick: false,
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
  }, [processedData, openingPrice]);

  // Handle tooltip and active point update
  const handleMouseMove = (e: any) => {
    if (e && e.activePayload && e.activePayload.length > 0) {
      setActivePoint(e.activePayload[0].payload);
    } else {
      setActivePoint(null);
    }
  };

  useEffect(() => {
    if (!chartData?.length) return;

    let historicalDays: number;
    let daysToShow: number;

    switch (activePredictionPeriod) {
      case "fiveDay":
        historicalDays = 15;
        daysToShow = 5;
        break;
      case "oneMonth":
        historicalDays = 30;
        daysToShow = 30;
        break;
      case "threeMonth":
        historicalDays = 90;
        daysToShow = 90;
        break;
      case "sixMonth":
        historicalDays = 120;
        daysToShow = 180;
        break;
      case "oneYear":
        historicalDays = 180;
        daysToShow = 365;
        break;
      default:
        historicalDays = 30;
        daysToShow = 30;
    }

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const currentTime = new Date().getTime();
    const cutoffTime = currentTime - historicalDays * millisecondsPerDay;

    const sortedChartData = [...chartData].sort((a, b) => {
      const timeA = a.timestamp || 0;
      const timeB = b.timestamp || 0;
      return timeB - timeA;
    });

    const latestDataPoint = sortedChartData[0] || {
      timestamp: Date.now(),
      price: coin?.currentPrice?.usd || 0,
    };
    const latestPrice = latestDataPoint.price;
    const latestTime = latestDataPoint.timestamp;

    const formattedHistoricalData = chartData
      .filter((point) => {
        const timestamp =
          typeof point.timestamp === "number"
            ? point.timestamp
            : new Date(String(point.timestamp)).getTime();
        return timestamp >= cutoffTime;
      })
      .map((point, index) => {
        const tickInterval =
          activePredictionPeriod === "fiveDay"
            ? 3
            : activePredictionPeriod === "oneMonth"
            ? 5
            : activePredictionPeriod === "threeMonth"
            ? 15
            : activePredictionPeriod === "sixMonth"
            ? 30
            : 60;

        const shouldShowTick = index % tickInterval === 0;

        return {
          time: point.timestamp,
          price: point.price,
          isHistorical: true,
          isMain: true,
          isTick: shouldShowTick,
        };
      });

    let predictionData: PredictionChartPoint[] = [];

    if (predictions) {
      let prediction: PredictionResult | null = null;

      switch (activePredictionPeriod) {
        case "fiveDay":
          prediction = predictions.fiveDay;
          break;
        case "oneMonth":
          prediction = predictions.oneMonth;
          break;
        case "threeMonth":
          prediction = predictions.threeMonth;
          break;
        case "sixMonth":
          prediction = predictions.sixMonth;
          break;
        case "oneYear":
          prediction = predictions.oneYear;
          break;
      }

      if (prediction) {
        const currentPrice = latestPrice || coin?.currentPrice?.usd || 0;
        const predictedPrice = prediction.price || 0;

        const bridgePoint = {
          time: latestTime || Date.now(),
          price: currentPrice,
          isHistorical: true,
          isPrediction: true,
          isMain: true,
          isTick: true,
          isBridge: true,
        };

        formattedHistoricalData.push(bridgePoint);

        const numPoints = daysToShow;
        const tickInterval =
          activePredictionPeriod === "fiveDay"
            ? 1
            : activePredictionPeriod === "oneMonth"
            ? 5
            : activePredictionPeriod === "threeMonth"
            ? 15
            : activePredictionPeriod === "sixMonth"
            ? 30
            : 60;

        for (let i = 0; i <= numPoints; i++) {
          const progress = i / numPoints;
          const date = new Date(
            latestTime + progress * daysToShow * millisecondsPerDay
          );
          const price =
            currentPrice + (predictedPrice - currentPrice) * progress;

          predictionData.push({
            time: date.getTime(),
            price: price,
            isHistorical: false,
            isMain: true,
            isTick: i % tickInterval === 0,
          });
        }
      }
    }

    const combinedData = [...formattedHistoricalData, ...predictionData].sort(
      (a, b) => a.time - b.time
    );

    setPredictionChart(combinedData);
  }, [activePredictionPeriod, chartData, predictions, coin?.currentPrice?.usd]);

  const calculatePrediction = (amount: number, date: Date) => {
    if (!coin?.currentPrice?.usd) {
      setPredictionResult(amount);
      setPredictionROI(0);
      return;
    }

    const now = new Date();
    const daysDifference = Math.floor(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    let predictionObj = null;

    if (daysDifference <= 5) {
      predictionObj = predictions?.fiveDay;
    } else if (daysDifference <= 30) {
      predictionObj = predictions?.oneMonth;
    } else if (daysDifference <= 90) {
      predictionObj = predictions?.threeMonth;
    } else if (daysDifference <= 180) {
      predictionObj = predictions?.sixMonth;
    } else {
      predictionObj = predictions?.oneYear;
    }

    if (!predictionObj) {
      setPredictionResult(amount);
      setPredictionROI(0);
      return;
    }

    const roi = predictionObj.roi || 0;
    const coinsToday = amount / coin.currentPrice.usd;
    const predictedAmount =
      coinsToday * (coin.currentPrice.usd * (1 + roi / 100));

    setPredictionResult(predictedAmount);
    setPredictionROI(roi);
  };

  const generateShortTermTargets = () => {
    if (
      !predictionChart?.length ||
      !coin.currentPrice?.usd ||
      !predictions?.fiveDay
    )
      return [];
    return Array.from({ length: 5 }, (_, i) => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + i + 1);
      return {
        id: i + 1,
        date: targetDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        prediction: {
          value: `$${predictions.fiveDay?.price || 0}`,
          trend: (predictions.fiveDay?.roi || 0) > 0 ? "up" : "down",
        },
        roi: `${(predictions.fiveDay?.roi || 0).toFixed(2)}%`,
      };
    });
  };

  const priceTargetsData = generateShortTermTargets();

  const generateSummaryText = () => {
    if (!priceTargetsData.length || !coin.currentPrice?.usd) return "";
    const highestPrediction = priceTargetsData.reduce(
      (max, target) => {
        const price = parseFloat(target.prediction.value.replace("$", ""));
        return price > max.price ? { price, date: target.date } : max;
      },
      { price: 0, date: "" }
    );

    const recentChange =
      predictionChart.length > 7
        ? (
            ((predictionChart[predictionChart.length - 1].price -
              predictionChart[predictionChart.length - 8].price) /
              predictionChart[predictionChart.length - 8].price) *
            100
          ).toFixed(2)
        : "0.00";

    const growthPercentage = (
      ((highestPrediction.price - coin.currentPrice.usd) /
        coin.currentPrice.usd) *
      100
    ).toFixed(2);

    return `Over the next five days, ${
      coin.name
    } will reach the highest price of $${highestPrediction.price.toFixed(
      6
    )} on ${
      highestPrediction.date
    }, which would represent <span class="highlight">${growthPercentage}%</span> growth compared to the current price. This follows a <span class="highlight">${recentChange}%</span> price change over the last 7 days.`;
  };

  const summaryText = generateSummaryText();
  const gridColor = theme.name === "dark" ? "#2D3748" : "#EDF2F7";
  const tooltipBg = theme.name === "dark" ? "#1A202C" : "#FFFFFF";
  const tooltipBorder = theme.name === "dark" ? "#4A5568" : "#E2E8F0";
  const tooltipText = theme.name === "dark" ? "#E2E8F0" : "#2D3748";
  const positiveColor = "#00D4AA";
  const negativeColor = "#F6465D";

  return (
    <CoinPredictionWrapper>
      {!isStablecoin ? (
        <PredictionWrapper
          id="prediction"
          onMouseEnter={() => handleSectionHover("prediction")}
        >
          <PredictionHeading>
            <PredictionTitle>
              {coin.name} ({coin.ticker}) Price Prediction 2025, 2026-
              {getLatestPredictionYear()}
            </PredictionTitle>
            <PredictionButtons />
          </PredictionHeading>
          <DescriptionCard>
            <p>
              Here&apos;s a short—and medium-term {coin?.name} price prediction
              analysis based on our advanced algorithm. This algorithm analyzes
              historical price data, volume trends, on-chain metrics, and
              technical indicators of various cryptocurrencies. The predictions
              below show potential price movements that can be expected over
              different time horizons with{" "}
              {predictions.fiveDay
                ? predictions?.fiveDay?.confidence < 20
                  ? `Fearful outlook at only ${predictions?.fiveDay?.confidence?.toFixed(
                      1
                    )}%`
                  : predictions?.fiveDay?.confidence >= 20 &&
                    predictions?.fiveDay?.confidence < 50
                  ? `Uncertain confidence at around ${predictions?.fiveDay?.confidence?.toFixed(
                      1
                    )}%`
                  : predictions?.fiveDay?.confidence === 50
                  ? `Neutral sentiments at ${predictions?.fiveDay?.confidence?.toFixed(
                      1
                    )}%`
                  : predictions?.fiveDay?.confidence > 50 &&
                    predictions?.fiveDay?.confidence < 75
                  ? `Reliable confidence level of ${predictions?.fiveDay?.confidence?.toFixed(
                      1
                    )}%`
                  : `Strong confidence of ${predictions?.fiveDay?.confidence?.toFixed(
                      1
                    )}%`
                : "no confidence data available"}
              .
            </p>
          </DescriptionCard>
          <PredictionButtonGrid>
            <GridButton
              onClick={() => setActivePredictionPeriod("fiveDay")}
              isActive={activePredictionPeriod === "fiveDay"}
            >
              <GridButtonLabel>5-Day Prediction</GridButtonLabel>
              <GridButtonValue>
                {isLoadingPredictions ? (
                  "Loading..."
                ) : predictions?.fiveDay ? (
                  <>
                    {renderArrow(
                      isPredictionHigher(predictions?.fiveDay?.price)
                    )}
                    $ {predictions?.fiveDay?.price?.toFixed(6)}
                  </>
                ) : (
                  "$ 0.000000"
                )}
              </GridButtonValue>
            </GridButton>

            <GridButton
              onClick={() => setActivePredictionPeriod("oneMonth")}
              isActive={activePredictionPeriod === "oneMonth"}
            >
              <GridButtonLabel>1-Month Prediction</GridButtonLabel>
              <GridButtonValue>
                {isLoadingPredictions ? (
                  "Loading..."
                ) : predictions?.oneMonth ? (
                  <>
                    {renderArrow(
                      isPredictionHigher(predictions?.oneMonth?.price)
                    )}
                    $ {predictions?.oneMonth?.price?.toFixed(6)}
                  </>
                ) : (
                  "$ 0.000000"
                )}
              </GridButtonValue>
            </GridButton>

            <GridButton
              onClick={() => setActivePredictionPeriod("threeMonth")}
              isActive={activePredictionPeriod === "threeMonth"}
            >
              <GridButtonLabel>3-Month Prediction</GridButtonLabel>
              <GridButtonValue>
                {isLoadingPredictions ? (
                  "Loading..."
                ) : predictions?.threeMonth ? (
                  <>
                    {renderArrow(
                      isPredictionHigher(predictions?.threeMonth?.price)
                    )}
                    $ {predictions?.threeMonth?.price?.toFixed(6)}
                  </>
                ) : (
                  "$ 0.000000"
                )}
              </GridButtonValue>
            </GridButton>

            <GridButton
              onClick={() => setActivePredictionPeriod("sixMonth")}
              isActive={activePredictionPeriod === "sixMonth"}
            >
              <GridButtonLabel>6-Month Prediction</GridButtonLabel>
              <GridButtonValue>
                {isLoadingPredictions ? (
                  "Loading..."
                ) : predictions?.sixMonth ? (
                  <>
                    {renderArrow(
                      isPredictionHigher(predictions?.sixMonth?.price)
                    )}
                    $ {predictions?.sixMonth?.price?.toFixed(6)}
                  </>
                ) : (
                  "$ 0.000000"
                )}
              </GridButtonValue>
            </GridButton>

            <GridButton
              onClick={() => setActivePredictionPeriod("oneYear")}
              isActive={activePredictionPeriod === "oneYear"}
            >
              <GridButtonLabel>1-Year Prediction</GridButtonLabel>
              <GridButtonValue>
                {isLoadingPredictions ? (
                  "Loading..."
                ) : predictions?.oneYear ? (
                  <>
                    {renderArrow(
                      isPredictionHigher(predictions?.oneYear?.price)
                    )}
                    $ {predictions?.oneYear?.price?.toFixed(6)}
                  </>
                ) : (
                  "$ 0.000000"
                )}
              </GridButtonValue>
            </GridButton>
          </PredictionButtonGrid>

          <div
            style={{
              marginTop: "16px",
              height: `${chart_height}px`,
              width: "100%",
              maxWidth: "100vw",
              borderRadius: "16px",
              border: `1px solid ${
                theme.name === "dark" ? "#2D3748" : "#E2E8F0"
              }`,
              padding: "0px 8px",
              overflow: "visible",
            }}
            id="prediction-chart"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={
                  processedData.length > 0
                    ? processedData
                    : [
                        {
                          time: Date.now(),
                          price: coin.currentPrice?.usd || 0,
                          isHistorical: true,
                        },
                      ]
                }
                margin={{ top: 20, right: -25, left: 10, bottom: 0 }}
                syncId="chart"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setActivePoint(null)}
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
                  <linearGradient
                    id="predictionGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#aaaaaa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#aaaaaa" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke={gridColor}
                  strokeOpacity={theme.name === "dark" ? 0.5 : 0.6}
                  horizontal={true}
                  vertical={false}
                  strokeWidth={1}
                />

                <XAxis
                  dataKey="time"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  scale="time"
                  tickFormatter={(time) =>
                    format(
                      new Date(time),
                      activePredictionPeriod === "fiveDay"
                        ? "MMM d"
                        : activePredictionPeriod === "oneYear"
                        ? "MMM yyyy"
                        : "MMM"
                    )
                  }
                  ticks={processedData
                    .filter((point) => point.isTick)
                    .map((point) => point.time)}
                  tick={{
                    fill: theme.name === "dark" ? "#A0AEC0" : "#718096",
                    fontSize: 12,
                  }}
                  axisLine={true}
                  strokeOpacity={theme.name === "dark" ? 0.5 : 0.65}
                  strokeWidth={0.5}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={30}
                >
                  <text
                    x={400}
                    y={chart_height - 20}
                    textAnchor="middle"
                    fill={theme.name === "dark" ? "#A0AEC0" : "#718096"}
                    style={{ fontSize: 12, fontWeight: 500 }}
                  >
                    Date
                  </text>
                </XAxis>

                <YAxis
                  orientation="right"
                  tickFormatter={(value) => {
                    const numValue = Number(value);
                    return numValue >= 1e9
                      ? `${getCurrencySymbol()}${(numValue / 1e9).toFixed(2)}B`
                      : numValue >= 1e6
                      ? `${getCurrencySymbol()}${(numValue / 1e6).toFixed(2)}M`
                      : numValue >= 1e3
                      ? `${getCurrencySymbol()}${(numValue / 1e3).toFixed(2)}K`
                      : numValue < 1
                      ? `${getCurrencySymbol()}${numValue.toFixed(6)}`
                      : `${getCurrencySymbol()}${numValue.toFixed(2)}`;
                  }}
                  tick={{
                    fill: theme.name === "dark" ? "#A0AEC0" : "#718096",
                    fontSize: 12,
                  }}
                  domain={[
                    Math.min(...processedData.map((d) => d.price || 0)) * 0.995,
                    Math.max(...processedData.map((d) => d.price || 0)) * 1.005,
                  ]}
                  axisLine={true}
                  strokeOpacity={theme.name === "dark" ? 0.5 : 0.65}
                  strokeWidth={0.5}
                  tickLine={false}
                  width={80}
                  tickCount={7}
                >
                  <text
                    x={70}
                    y={10}
                    textAnchor="start"
                    fill={theme.name === "dark" ? "#A0AEC0" : "#718096"}
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      transform: "rotate(-90deg)",
                    }}
                  >
                    Price (USD)
                  </text>
                </YAxis>

                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.[0] ? (
                      <div
                        style={{
                          backgroundColor: tooltipBg,
                          padding: "8px",
                          border: `1px solid ${tooltipBorder}`,
                          color: tooltipText,
                        }}
                      >
                        {new Date(payload[0].payload.time).toLocaleDateString()}{" "}
                        - {getCurrencySymbol()}
                        {convertPrice(payload[0].value).toFixed(2)}
                      </div>
                    ) : null
                  }
                  cursor={{
                    stroke: theme.name === "dark" ? "#718096" : "#A0AEC0",
                    strokeWidth: 1,
                    strokeDasharray: "3 3",
                  }}
                />

                <ReferenceLine
                  y={openingPrice}
                  stroke={theme.name === "dark" ? "#A0AEC0" : "#718096"}
                  strokeDasharray="3 3"
                  isFront={true}
                />
                <ReferenceLine
                  x={Date.now()}
                  stroke={theme.name === "dark" ? "#A0AEC0" : "#718096"}
                  strokeDasharray="3 3"
                  label={{
                    value: "Today",
                    position: "insideTopRight",
                    fill: theme.name === "dark" ? "#A0AEC0" : "#718096",
                    fontSize: 10,
                  }}
                />

                {historicalColorSegments.map((segment, index) => (
                  <Area
                    key={`historical-segment-${index}`}
                    type="monotoneX"
                    data={segment.data}
                    dataKey="priceVisual"
                    stroke={segment.isAbove ? positiveColor : negativeColor}
                    fill={
                      segment.isAbove
                        ? "url(#positiveGradient)"
                        : "url(#negativeGradient)"
                    }
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={false}
                    isAnimationActive={true}
                    animationDuration={600}
                    animationEasing="ease-out"
                    connectNulls={true}
                    legendType="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    baseValue={openingPrice}
                  />
                ))}

                <Area
                  type="monotoneX"
                  dataKey="priceVisual"
                  stroke="#aaaaaaff"
                  fill="url(#predictionGradient)"
                  strokeWidth={0.5}
                  dot={false}
                  activeDot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <PredictionPriceGrid>
            <GridPrice>
              <GridPriceRow>
                <GridPriceLabel>Current Price</GridPriceLabel>
                <GridPriceValue>
                  ${" "}
                  {coin?.currentPrice?.usd
                    ? coin?.currentPrice?.usd?.toFixed(6)
                    : "0.000000"}
                </GridPriceValue>
              </GridPriceRow>
              <GridPriceRow>
                <GridPriceLabel>Sentiment</GridPriceLabel>
                <GridPriceValue>
                  {rawPredictionData.current?.predictions?.fiveDay?.sentiment ||
                    "Neutral"}
                </GridPriceValue>
              </GridPriceRow>
              <GridPriceRow>
                <GridPriceLabel>50-Day SMA</GridPriceLabel>
                <GridPriceValue>
                  ${" "}
                  {rawPredictionData.current?.technicalIndicators?.sma50
                    ? rawPredictionData.current.technicalIndicators.sma50.toFixed(
                        6
                      )
                    : coin?.currentPrice?.usd
                    ? (coin?.currentPrice?.usd * 0.98).toFixed(6)
                    : "0.000000"}
                </GridPriceValue>
              </GridPriceRow>
            </GridPrice>

            <GridPrice>
              <GridPriceRow>
                <GridPriceLabel>Price Prediction</GridPriceLabel>
                <GridPriceValue>
                  ${" "}
                  {rawPredictionData?.current?.predictions?.oneMonth?.price
                    ? rawPredictionData?.current?.predictions?.oneMonth?.price?.toFixed(
                        6
                      )
                    : "0.000000"}
                </GridPriceValue>
              </GridPriceRow>
              <GridPriceRow>
                <GridPriceLabel>Fear & Greed Index</GridPriceLabel>
                <GridPriceValue>
                  {rawPredictionData?.current?.technicalIndicators
                    ?.fearGreedIndex
                    ? `${Math.round(
                        rawPredictionData?.current?.technicalIndicators
                          ?.fearGreedIndex
                      )} (${
                        rawPredictionData?.current?.technicalIndicators
                          ?.fearGreedZone
                      })`
                    : "33 (Fear)"}
                </GridPriceValue>
              </GridPriceRow>
              <GridPriceRow>
                <GridPriceLabel>200-Day SMA</GridPriceLabel>
                <GridPriceValue>
                  ${" "}
                  {rawPredictionData?.current?.technicalIndicators?.sma200
                    ? rawPredictionData?.current?.technicalIndicators?.sma200?.toFixed(
                        6
                      )
                    : coin?.currentPrice?.usd
                    ? (coin?.currentPrice?.usd * 0.95).toFixed(6)
                    : "0.000000"}
                </GridPriceValue>
              </GridPriceRow>
            </GridPrice>

            <GridPrice>
              <GridPriceRow>
                <GridPriceLabel>Green Days</GridPriceLabel>
                <GridPriceValue>
                  {rawPredictionData?.current?.technicalIndicators?.greenDays ||
                    "11/30 (37%)"}
                </GridPriceValue>
              </GridPriceRow>
              <GridPriceRow>
                <GridPriceLabel>Volatility</GridPriceLabel>
                <GridPriceValue>
                  {rawPredictionData?.current?.technicalIndicators?.volatility
                    ? `${rawPredictionData?.current?.technicalIndicators?.volatility?.toFixed(
                        2
                      )}%`
                    : "17.83%"}
                </GridPriceValue>
              </GridPriceRow>
              <GridPriceRow>
                <GridPriceLabel>14-Day RSI</GridPriceLabel>
                <GridPriceValue>
                  {rawPredictionData?.current?.technicalIndicators?.rsi14
                    ? rawPredictionData?.current?.technicalIndicators?.rsi14?.toFixed(
                        2
                      )
                    : "62.02"}
                </GridPriceValue>
              </GridPriceRow>
            </GridPrice>
          </PredictionPriceGrid>

          <PredictionDescription>
            According to our current {coin?.name} ({coin?.ticker}) price
            prediction, the price is predicted{" "}
            {predictions?.oneMonth && predictions?.oneMonth?.roi < -5
              ? `to significantly decline by ${Math.abs(
                  predictions?.oneMonth?.roi
                ).toFixed(
                  2
                )}% and reach $${predictions?.oneMonth?.price?.toFixed(6)}`
              : predictions?.oneMonth && predictions?.oneMonth?.roi < 0
              ? `to slightly drop by ${Math.abs(
                  predictions?.oneMonth?.roi
                ).toFixed(
                  2
                )}% and stand at $${predictions?.oneMonth?.price?.toFixed(6)}`
              : predictions?.oneMonth && predictions?.oneMonth?.roi === 0
              ? `to have a steady level and stand at $${predictions?.oneMonth?.price?.toFixed(
                  6
                )}`
              : predictions?.oneMonth &&
                predictions?.oneMonth?.roi > 0 &&
                predictions?.oneMonth?.roi <= 5
              ? `to slightly rise by ${predictions?.oneMonth?.roi?.toFixed(
                  2
                )}% and touch $${predictions?.oneMonth?.price?.toFixed(6)}`
              : predictions?.oneMonth &&
                predictions?.oneMonth?.roi > 5 &&
                predictions?.oneMonth?.roi <= 20
              ? `to rise on a decent level by ${predictions?.oneMonth?.roi?.toFixed(
                  2
                )}% and reach $${predictions?.oneMonth?.price?.toFixed(6)}`
              : predictions?.oneMonth && predictions?.oneMonth?.roi > 20
              ? `to have a whopping rise of ${predictions?.oneMonth?.roi?.toFixed(
                  2
                )}% and cross $${predictions?.oneMonth?.price?.toFixed(6)}`
              : `to change by 0.00% and remain at $${
                  coin?.currentPrice?.usd?.toFixed(6) || "0.000000"
                }`}{" "}
            by{" "}
            {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
              "en-US",
              { month: "long", day: "numeric", year: "numeric" }
            )}
            . Per our technical indicators, the current sentiment is{" "}
            {predictions?.fiveDay ? predictions?.fiveDay?.sentiment : "Neutral"}{" "}
            while the Fear & Greed Index shows{" "}
            {rawPredictionData?.current?.technicalIndicators?.fearGreedIndex
              ? `${Math.round(
                  rawPredictionData?.current?.technicalIndicators
                    ?.fearGreedIndex
                )} (${
                  rawPredictionData?.current?.technicalIndicators?.fearGreedZone
                })`
              : "33 (Fear)"}
            . {coin?.name} recorded{" "}
            {rawPredictionData?.current?.technicalIndicators?.greenDays ||
              "11/30 (37%)"}{" "}
            green days with{" "}
            {rawPredictionData?.current?.technicalIndicators?.volatility
              ? `${rawPredictionData?.current?.technicalIndicators?.volatility?.toFixed(
                  2
                )}%`
              : "17.83%"}{" "}
            price volatility over the last 30 days. Based on the {coin?.name}{" "}
            forecast, it&apos;s now a{" "}
            {predictions?.oneMonth && predictions?.oneMonth?.roi > 15
              ? "good"
              : predictions?.oneMonth && predictions?.oneMonth?.roi > 0
              ? "moderate"
              : "bad"}{" "}
            time to buy {coin?.name}.
          </PredictionDescription>

          <PurchasePredictionWrapper>
            <PredictionInputsGrid>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  position: "relative",
                }}
              >
                <label
                  style={{
                    fontSize: "12px",
                    marginBottom: "4px",
                    color: theme.name === "dark" ? "#888888" : "#555555",
                  }}
                >
                  Investment amount
                </label>
                <div style={{ position: "relative", width: "100%" }}>
                  <PredictionInput
                    type="number"
                    value={investmentAmount}
                    min={1}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value !== "") {
                        handleInvestmentChange(Number(value));
                      } else {
                        handleInvestmentChange(1);
                      }
                    }}
                    placeholder="Investment amount"
                    aria-label="Investment amount"
                    step="0.01"
                    style={{
                      paddingRight: "50px",
                      appearance: "textfield",
                      WebkitAppearance: "textfield",
                      MozAppearance: "textfield",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  position: "relative",
                }}
              >
                <label
                  style={{
                    fontSize: "12px",
                    marginBottom: "4px",
                    color: theme.name === "dark" ? "#888888" : "#555555",
                  }}
                >
                  Prediction date
                </label>
                <div style={{ position: "relative", width: "100%" }}>
                  <DateInput
                    as="input"
                    type="date"
                    value={selectedDate.toISOString().split("T")[0]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const newDate = new Date(e.target.value);
                      if (!isNaN(newDate.getTime())) {
                        setSelectedDate(newDate);
                        calculatePrediction(investmentAmount, newDate);
                      }
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    style={{
                      colorScheme: theme.name === "dark" ? "dark" : "light",
                      cursor: "pointer",
                      width: "100%",
                      paddingRight: "30px",
                    }}
                    aria-label="Prediction date"
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={theme.name === "dark" ? "#ffffff" : "#555555"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "end",
                  height: "100%",
                  paddingBottom: "10px",
                }}
              >
                <PredictionResult>
                  {coin.currentPrice?.usd ? (
                    <>
                      <span>≈</span> ${formatCurrency(predictionResult)}
                    </>
                  ) : (
                    <>
                      <span>≈</span> ${formatCurrency(investmentAmount)}
                    </>
                  )}
                </PredictionResult>
              </div>

              <BuyNowButton
                onClick={() =>
                  window.open(
                    "https://www.mexc.com/acquisition/custom-sign-up?shareCode=mexc-12RA4q",
                    "_blank"
                  )
                }
              >
                Buy Now
              </BuyNowButton>
            </PredictionInputsGrid>
            <PredictionSummary>
              {coin?.currentPrice?.usd ? (
                <>
                  If you invest{" "}
                  <strong>${formatCurrency(investmentAmount)}</strong> in{" "}
                  {coin?.name} today and hold until{" "}
                  <strong>
                    {selectedDate?.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </strong>
                  , our prediction suggests you could see a potential{" "}
                  {predictionResult > investmentAmount
                    ? Math.abs(predictionResult - investmentAmount) < 250
                      ? "modest profit of"
                      : Math.abs(predictionResult - investmentAmount) >= 250 &&
                        Math.abs(predictionResult - investmentAmount) <= 500
                      ? "significant profit of"
                      : "impressive return of"
                    : "loss of"}{" "}
                  <span
                    className={
                      predictionResult > investmentAmount
                        ? "highlight"
                        : "highlight-negative"
                    }
                  >
                    $
                    {formatCurrency(
                      Math.abs(predictionResult - investmentAmount)
                    )}
                  </span>
                  , reflecting a{" "}
                  {predictionResult > investmentAmount
                    ? predictionROI < 10
                      ? "decent"
                      : predictionROI >= 10 && predictionROI <= 25
                      ? "favourable"
                      : "exceptional"
                    : "negative"}{" "}
                  <span
                    className={
                      predictionResult > investmentAmount
                        ? "highlight"
                        : "highlight-negative"
                    }
                  >
                    {predictionROI.toFixed(2)}%
                  </span>{" "}
                  ROI over the next{" "}
                  {Math.floor(
                    (selectedDate.getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days (fees are not included in this estimate).
                </>
              ) : (
                <>Loading prediction data...</>
              )}
            </PredictionSummary>
          </PurchasePredictionWrapper>

          <PredictionDisclaimer>
            <strong>Investment Disclaimer:</strong> Cryptocurrency markets are
            highly volatile and unpredictable. The price predictions shown are
            based on algorithmic forecasts, economic influences, on-chain
            analysis, and historical data analysis, but should not be
            interpreted as financial advice. Past performance is not indicative
            of future results. Always conduct your own research and consider
            consulting with a financial advisor before making investment
            decisions.{" "}
            <CustomLink href="/disclaimer">
              Learn more about how we calculate predictions
            </CustomLink>
          </PredictionDisclaimer>

          <PriceTargetsTable
            title={`Short-Term ${coin.name} Price Targets`}
            columns={priceTargetsColumns}
            data={priceTargetsData}
            summaryText={summaryText}
            rowsPerPage={5}
            onBuyClick={(item) => {
              window.open(
                `https://www.mexc.com/acquisition/custom-sign-up?shareCode=mexc-12RA4q`,
                "_blank"
              );
            }}
          />

          <MarketStatsTable>
            <MarketStatsTitle>
              Current Market Statistics for ${coin.ticker}
            </MarketStatsTitle>
            <MarketStatsRow>
              <MarketStatsLabel>Current Price</MarketStatsLabel>
              <MarketStatsValue>
                ${formatNumber(coin.currentPrice?.usd || 85779.51)}
              </MarketStatsValue>
            </MarketStatsRow>
            <MarketStatsRow>
              <MarketStatsLabel>Market Cap</MarketStatsLabel>
              <MarketStatsValue>
                ${formatNumber(coin.marketData?.marketCap || 1700516451281)}
              </MarketStatsValue>
            </MarketStatsRow>
            <MarketStatsRow>
              <MarketStatsLabel>24-Hour Trading Volume</MarketStatsLabel>
              <MarketStatsValue>
                ${formatNumber(coin.marketData?.volume24h || 39056273793)}
              </MarketStatsValue>
            </MarketStatsRow>
            <MarketStatsRow>
              <MarketStatsLabel>7-Day Change</MarketStatsLabel>
              <MarketStatsValue style={{ color: "#16c784" }}>
                +3.1%
              </MarketStatsValue>
            </MarketStatsRow>
            <MarketStatsRow>
              <MarketStatsLabel>30-Day Change</MarketStatsLabel>
              <MarketStatsValue style={{ color: "#ea3943" }}>
                -10.3%
              </MarketStatsValue>
            </MarketStatsRow>
            <MarketStatsRow>
              <MarketStatsLabel>1-Year Change</MarketStatsLabel>
              <MarketStatsValue style={{ color: "#16c784" }}>
                +39.4%
              </MarketStatsValue>
            </MarketStatsRow>
          </MarketStatsTable>

          <div>
            <PriceTargetsHeader>
              <h2>{coin?.name} Prediction Table</h2>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {getVisibleYears(yearOptions, selectedYear).map(
                  (yearOrEllipsis, index) => {
                    if (yearOrEllipsis === "...") {
                      return (
                        <div
                          key={`ellipsis-${index}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "40px",
                            height: "32px",
                            padding: "0 8px",
                            margin: "0 2px",
                            borderRadius: "4px",
                            background: "rgba(200, 200, 200, 0.1)",
                            color: "#888",
                            fontWeight: "bold",
                            fontSize: "14px",
                          }}
                        >
                          •••
                        </div>
                      );
                    } else {
                      const year = yearOrEllipsis as number;
                      return (
                        <ActionButton
                          key={year}
                          primary={selectedYear === year}
                          onClick={() => setSelectedYear(year)}
                        >
                          {year}
                        </ActionButton>
                      );
                    }
                  }
                )}
              </div>
            </PriceTargetsHeader>

            <PriceTargetsTable
              title=""
              columns={longTermPredictionColumns}
              data={formatPredictionData(yearlyPredictions[selectedYear] || [])}
              summaryText={getLongTermSummary(selectedYear)}
              rowsPerPage={12}
              onBuyClick={(item) => {
                window.open(
                  `https://www.mexc.com/acquisition/custom-sign-up?shareCode=mexc-12RA4q`,
                  "_blank"
                );
              }}
            />
          </div>

          <MonthlyPredictionWrapper>
            <PriceTargetsHeader>
              <h2>
                {coin?.name} Price Prediction {selectedYear}
              </h2>
            </PriceTargetsHeader>

            {yearlyPredictions[selectedYear]?.length > 0 &&
              yearlyPredictions[selectedYear].map((prediction, index) => {
                const descriptionContent = prediction.description
                  ? prediction.description.split("Potential ROI:")[0].trim()
                  : "";

                const roiColor = prediction.sentiment
                  ?.toLowerCase()
                  .includes("bullish")
                  ? theme.colors.success || "#16c784"
                  : prediction.sentiment?.toLowerCase().includes("bearish")
                  ? theme.colors.error || "#ea3943"
                  : theme.colors.text || "#ffffff";

                const fullMonthName = prediction.month;

                return (
                  <MonthlyPredictionCard key={index}>
                    <MonthlyPredictionTitle>
                      {fullMonthName} {prediction.year}: {coin.name} Prediction
                    </MonthlyPredictionTitle>
                    <MonthlyPredictionDescription
                      dangerouslySetInnerHTML={{ __html: descriptionContent }}
                    />
                    <MonthlyPredictionFooter>
                      <PotentialROI>
                        {parseFloat(
                          prediction.roi
                            .toString()
                            .replace("%", "")
                            .replace(",", "")
                        ) <= 10
                          ? "Potentially decent ROI: "
                          : parseFloat(
                              prediction.roi
                                .toString()
                                .replace("%", "")
                                .replace(",", "")
                            ) <= 25
                          ? "Potentially favourable ROI: "
                          : parseFloat(
                              prediction.roi
                                .toString()
                                .replace("%", "")
                                .replace(",", "")
                            ) <= 40
                          ? "Potentially higher ROI: "
                          : "Potentially impressive ROI: "}{" "}
                        {typeof prediction.roi === "number"
                          ? `${
                              prediction.roi > 0 ? "+" : ""
                            }${prediction.roi.toFixed(2)}%`
                          : prediction.roi}
                      </PotentialROI>
                      <ActionButton
                        primary={true}
                        style={{ width: "100px" }}
                        onClick={() =>
                          window.open(
                            "https://www.mexc.com/acquisition/custom-sign-up?shareCode=mexc-12RA4q",
                            "_blank"
                          )
                        }
                      >
                        Buy
                      </ActionButton>
                    </MonthlyPredictionFooter>
                  </MonthlyPredictionCard>
                );
              })}
          </MonthlyPredictionWrapper>

          <TechnicalsWrapper>
            <TechnicalTitle>{coin?.name} Technical Analysis</TechnicalTitle>
            <TechnicalContent>
              <LeftSection>
                <SentimentRow>
                  <SentimentLabel>Sentiment</SentimentLabel>
                  <SentimentValue
                    $isBearish={sentimentData.bearishPercent > 50}
                  >
                    {sentimentData.technicalSummary.toUpperCase()}
                  </SentimentValue>
                </SentimentRow>
                <ProgressContainer>
                  <ProgressBar>
                    <BullishBar $width={sentimentData.bullishPercent} />
                    <BearishBar $width={sentimentData.bearishPercent} />
                  </ProgressBar>
                  <ProgressLabels>
                    <BullishLabel>
                      Bullish {sentimentData.bullishPercent}%
                    </BullishLabel>
                    <BearishLabel>
                      Bearish {sentimentData.bearishPercent}%
                    </BearishLabel>
                  </ProgressLabels>
                </ProgressContainer>
              </LeftSection>
              <RightSection>
                <AnalysisText>
                  Based on data from{" "}
                  {new Date(sentimentData.lastUpdated).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )}{" "}
                  at{" "}
                  {new Date(sentimentData.lastUpdated).toLocaleTimeString(
                    "en-US",
                    { hour: "2-digit", minute: "2-digit" }
                  )}
                  , the general {coin.name} price prediction sentiment is{" "}
                  <BearishSpan>
                    {sentimentData.bearishPercent > 50 ? "bearish" : "bullish"}
                  </BearishSpan>
                  , with{" "}
                  <BullishSpan>{sentimentData.bullishIndicators}</BullishSpan>{" "}
                  technical analysis indicators signaling bullish signals, and{" "}
                  <BearishSpan>{sentimentData.bearishIndicators}</BearishSpan>{" "}
                  signaling bearish signals.
                </AnalysisText>
                <UpdateText>
                  {coin?.name} price prediction was last updated on{" "}
                  {new Date(sentimentData?.lastUpdated).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )}{" "}
                  at{" "}
                  {new Date(sentimentData.lastUpdated).toLocaleTimeString(
                    "en-US",
                    { hour: "2-digit", minute: "2-digit" }
                  )}
                  .
                </UpdateText>
              </RightSection>
            </TechnicalContent>
          </TechnicalsWrapper>
        </PredictionWrapper>
      ) : (
        <PredictionWrapper
          id="prediction"
          onMouseEnter={() => handleSectionHover("prediction")}
        >
          <PredictionHeading>
            <PredictionTitle>
              {coin?.name} ({coin?.ticker}) Price Information
            </PredictionTitle>
          </PredictionHeading>
          <DescriptionCard>
            <p>
              {coin?.name} is a stablecoin designed to maintain a steady value,
              typically pegged to a fiat currency or other asset. As such, price
              predictions are not applicable since the token is engineered to
              maintain price stability rather than appreciate in value. The
              primary purpose of {coin?.name} is to provide a stable medium of
              exchange and store of value within the cryptocurrency ecosystem.
            </p>
          </DescriptionCard>
          <div
            style={{
              margin: "30px 0",
              padding: "20px",
              background:
                typeof theme.colors.cardBackground === "string"
                  ? theme.colors.cardBackground
                  : "#1a1a1a",
              borderRadius: "8px",
              border: `1px solid ${theme.colors.borderColor}`,
            }}
          >
            <h3 style={{ marginBottom: "15px" }}>Stablecoin Information</h3>
            <p>
              <strong>Current Price:</strong> $
              {coin?.currentPrice?.usd
                ? coin?.currentPrice?.usd?.toFixed(6)
                : "0.000000"}
            </p>
            <p>
              <strong>Peg Type:</strong>{" "}
              {coin?.name?.toLowerCase()?.includes("usd")
                ? "USD-pegged"
                : "Asset-backed"}
            </p>
            <p>
              <strong>24h Deviation:</strong>{" "}
              {coin?.priceChanges?.day1
                ? `${Math.abs(coin?.priceChanges?.day1).toFixed(4)}%`
                : "0.0000%"}
            </p>
            <p style={{ marginTop: "15px" }}>
              Unlike volatile cryptocurrencies, {coin?.name} is designed to
              maintain a stable value. Small price fluctuations may occur due to
              market dynamics, but the underlying mechanisms work to return the
              price to its target value.
            </p>
          </div>
        </PredictionWrapper>
      )}

      {!isStablecoin && (
        <>
          <FAQ
            coinName={coin?.name}
            coinTicker={coin?.ticker}
            setActiveSection={handleSectionHover.bind(this, "prediction")}
            predictionData={faqPredictionData}
          />
          <PriceGuide
            onMouseEnter={() => handleSectionHover("prediction")}
            coinName={coin?.name}
            coinTicker={coin?.ticker}
          />
        </>
      )}
    </CoinPredictionWrapper>
  );
};

export default dynamic(() => Promise.resolve(PredictionCoin), { ssr: false });

export { PredictionCoin };
