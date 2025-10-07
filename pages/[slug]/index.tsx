import React, {
  useEffect,
  useState,
  useRef,
  Suspense,
  useCallback,
} from "react";
import { useRouter } from "next/router";
import { useCurrency } from "../../src/context/CurrencyContext";
import { GetStaticPaths } from "next";
import styled from "styled-components";
import SEO from "components/SEO/SEO";
import { Container } from "styled/elements/Container";
import { capitalize } from "lodash";
import prisma from "../../src/lib/prisma";
import { formatCryptoPrice, formatLargeNumber } from "../../src/utils/format";
import { parseTokenSlug } from "utils/url";
import { getApiUrl, getPageUrl } from "utils/config";
import CoinLeftSidebar from "components/pages/coin/CoinLeftSidebar/CoinLeftSidebar";
import CoinRightSidebar from "components/pages/coin/CoinRightSidebar/CoinRightSidebar";
import CoinMainContent from "components/CoinMainContent/CoinMainContent";
import { redisHandler } from "utils/redis";
import ErrorBoundary from "../../src/components/ErrorBoundary/ErrorBoundary";
import MobileCoin from "components/MobileCoin/MobileCoin";
import { getFAQsForCoin } from "components/FAQ/faqData";
import { Exchange, TokenDescription } from "types";

const DEFAULT_OG_IMAGE = `${
  process.env.NEXT_PUBLIC_URL || "https://droomdroom.com"
}/HomePageSocialSnippet.png`;

interface CoinProps {
  coin: TokenDescription;
  topTokens: TokenDescription[];
  exchangeData?: Exchange[];
  predictionData?: any;
  initialSection?: string | null;
}

const getCategoryString = (coinData: any): string => {
  if (!coinData || !coinData.categories) return "Cryptocurrency";

  try {
    return Array.isArray(coinData.categories)
      ? coinData.categories
          .map((c: any) => {
            if (c && typeof c === "object") {
              if (
                c.category &&
                typeof c.category === "object" &&
                c.category.name
              ) {
                return c.category.name;
              }
              if ("name" in c) {
                return c.name;
              }
            }
            return null;
          })
          .filter(Boolean)
          .join(", ") || "Cryptocurrency"
      : "Cryptocurrency";
  } catch (e) {
    console.error("Error parsing categories:", e);
    return "Cryptocurrency";
  }
};

export const getStaticProps = async (context: any) => {
  const { params, query = {} } = context;

  const rawSlug = String(params?.slug || "");
  const isPredictionUrl = rawSlug.endsWith("/prediction");
  const hasOriginalPathParam = query.originalPath === "prediction";
  const isPrediction = isPredictionUrl || hasOriginalPathParam;
  const section = query.section || (isPrediction ? "prediction" : null);
  let cleanSlug = rawSlug;
  if (cleanSlug.endsWith("/prediction")) {
    cleanSlug = cleanSlug.replace("/prediction", "");
  }

  if (!params || !cleanSlug) {
    return {
      notFound: true,
    };
  }
  try {
    let inCache: any = null;

    // Only try Redis during runtime, not during build
    if (process.env.NODE_ENV !== "production" || process.env.REDIS_URL) {
      try {
        inCache = await redisHandler.get(`droomdroom_coin_${cleanSlug}`);
      } catch (redisError) {
        console.warn("Redis not available during build, skipping cache check");
        inCache = null;
      }
    }

    if (inCache) {
      const parsedCache =
        typeof inCache === "string" ? JSON.parse(inCache) : inCache;

      if (
        section &&
        (!parsedCache.props.initialSection ||
          parsedCache.props.initialSection !== section)
      ) {
        const modifiedProps = {
          ...parsedCache.props,
          initialSection: section,
        };
        return { props: modifiedProps };
      }

      return parsedCache.props
        ? { props: parsedCache.props }
        : { props: parsedCache };
    }
    const topTokens = await prisma.token.findMany({
      where: {
        rank: {
          not: null,
          lte: 5,
        },
      },
      orderBy: {
        rank: "asc",
      },
      include: {
        currentPrice: true,
      },
      take: 5,
    });
    if (!cleanSlug) {
      return { notFound: true };
    }

    const slugString = cleanSlug.toString();
    const parsed = parseTokenSlug(slugString);

    if (!parsed) {
      return { notFound: true };
    }

    const { name, ticker } = parsed;
    const coin = await prisma.token.findFirst({
      where: {
        slug: {
          equals: cleanSlug,
          mode: "insensitive",
        },
      },
      include: {
        currentPrice: true,
        marketData: true,
        networkAddresses: {
          include: {
            networkType: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        socials: true,
        priceChanges: true,
        tradingMarkets: true,
        history: {
          orderBy: {
            timestamp: "desc",
          },
          take: 1000,
        },
      },
    });

    if (!coin) {
      const nameWords = name
        .toLowerCase()
        .replace(/[()]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 0);

      const flexibleCoin = await prisma.token.findFirst({
        where: {
          AND: [
            {
              ticker: {
                equals: ticker,
                mode: "insensitive",
              },
            },
            {
              OR: nameWords.map((word) => ({
                name: {
                  contains: word,
                  mode: "insensitive",
                },
              })),
            },
          ],
        },
        include: {
          currentPrice: true,
          marketData: true,
          networkAddresses: {
            include: {
              networkType: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
          socials: true,
          priceChanges: true,
          tradingMarkets: true,
          history: {
            orderBy: {
              timestamp: "desc",
            },
            take: 1000,
          },
        },
      });

      if (!flexibleCoin) {
        return { notFound: true };
      }

      if (flexibleCoin.cmcId) {
        try {
          const response = await fetch(
            `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${flexibleCoin.cmcId}`,
            {
              headers: {
                "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY || "",
              },
            }
          );
          const data = await response.json();

          if (data.data && data.data[flexibleCoin.cmcId]) {
            const cmcData = data.data[flexibleCoin.cmcId].quote.USD;

            const priceData = {
              price: cmcData.price,
              price_change_24h: cmcData.percent_change_24h,
              volume: cmcData.volume_24h,
              volume_change_24h: cmcData.volume_change_24h,
              market_cap: cmcData.market_cap,
            };

            await redisHandler.set(`price_${flexibleCoin.id}`, priceData, {
              expirationTime: 60,
            });

            (flexibleCoin as any).currentPrice.usd = cmcData.price;
            (flexibleCoin as any).priceChanges.day1 =
              cmcData.percent_change_24h;
            (flexibleCoin as any).marketData.volume24h = cmcData.volume_24h;
            (flexibleCoin as any).marketData.volumeChange24h =
              cmcData.volume_change_24h;
            (flexibleCoin as any).marketData.marketCap = cmcData.market_cap;
          }
        } catch (error) {
          console.error("Error fetching price from CMC:", error);
          let price: any = await redisHandler.get(`price_${flexibleCoin.id}`);
          if (price) (flexibleCoin as any).currentPrice.usd = price?.price;
        }
      } else {
        let price: any = await redisHandler.get(`price_${flexibleCoin.id}`);
        if (price) (flexibleCoin as any).currentPrice.usd = price?.price;
      }

      if (!flexibleCoin.cmcId && flexibleCoin.cmcSlug) {
        try {
          const response = await fetch(
            `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?slug=${flexibleCoin.cmcSlug}`,
            {
              headers: {
                "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY || "",
              },
            }
          );
          const data = await response.json();
          if (data.data && Object.keys(data.data).length > 0) {
            const id = Object.keys(data.data)[0];
            (flexibleCoin as any).cmcId = id;
          }
        } catch (error) {
          console.error("Error fetching CMC ID from slug:", error);
        }
      }

      let exchangeData = [];
      if (
        flexibleCoin.tradingMarkets &&
        flexibleCoin.tradingMarkets.length > 0
      ) {
        try {
          const exchangeNames = [
            ...new Set(
              flexibleCoin.tradingMarkets.map((market) => market.exchange)
            ),
          ];
          const exchangeDataPromises = exchangeNames.map(
            async (exchangeName) => {
              const exchange = await prisma.exchange.findUnique({
                where: {
                  name: exchangeName,
                },
                select: {
                  name: true,
                  logo: true,
                  rank: true,
                  spotVolumeUsd: true,
                  slug: true,
                },
              });
              return exchange;
            }
          );

          const exchanges = await Promise.all(exchangeDataPromises);

          exchangeData = flexibleCoin.tradingMarkets.map((market) => {
            const exchangeInfo = exchanges.find(
              (e) => e?.name === market.exchange
            );
            return {
              ...market,
              logoUrl: exchangeInfo?.logo || null,
              slug: exchangeInfo?.slug || null,
            };
          });

          flexibleCoin.tradingMarkets = exchangeData;
        } catch (error) {
          console.error("Error fetching exchange data:", error);
        }
      }
      // Fetch prediction data for SEO if coin has cmcId
      let predictionData = null;
      if (flexibleCoin.cmcId) {
        try {
          console.log(
            `Fetching predictions for ${flexibleCoin.cmcId} during static generation`
          );
          const predictionResponse = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
            }/api/coin/prediction/${flexibleCoin.cmcId}`,
            {
              headers: {
                "X-Precompute-Key":
                  process.env.PRECOMPUTE_AUTH_KEY ||
                  "secure-precompute-key-123",
              },
            }
          );
          if (predictionResponse.ok) {
            predictionData = await predictionResponse.json();
          }
        } catch (error) {
          console.warn(
            `Failed to fetch predictions for ${flexibleCoin.cmcId}:`,
            error
          );
        }
      }

      let serverData = {
        props: {
          coin: JSON.parse(JSON.stringify(flexibleCoin)),
          topTokens: JSON.parse(JSON.stringify(topTokens)),
          predictionData: predictionData,
          initialSection: section,
          forcePredictionMode: isPrediction,
        },
        revalidate: 3600,
      };
      redisHandler.set(
        `droomdroom_coin_${cleanSlug}`,
        JSON.stringify(serverData),
        { expirationTime: 60 * 60 }
      );
      return serverData;
    }

    if (coin.cmcId) {
      try {
        const response = await fetch(
          `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${coin.cmcId}`,
          {
            headers: {
              "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY || "",
            },
          }
        );
        const data = await response.json();

        if (data.data && data.data[coin.cmcId]) {
          const cmcData = data.data[coin.cmcId].quote.USD;

          const priceData = {
            price: cmcData.price,
            price_change_24h: cmcData.percent_change_24h,
            volume: cmcData.volume_24h,
            volume_change_24h: cmcData.volume_change_24h,
            market_cap: cmcData.market_cap,
          };

          await redisHandler.set(`price_${coin.id}`, priceData, {
            expirationTime: 60,
          }); // Cache for 1 minute

          (coin as any).currentPrice.usd = cmcData.price;
          (coin as any).priceChanges.day1 = cmcData.percent_change_24h;
          (coin as any).marketData.volume24h = cmcData.volume_24h;
          (coin as any).marketData.volumeChange24h = cmcData.volume_change_24h;
          (coin as any).marketData.marketCap = cmcData.market_cap;
        }
      } catch (error) {
        console.error("Error fetching price from CMC:", error);
        let price: any = await redisHandler.get(`price_${coin.id}`);
        if (price) (coin as any).currentPrice.usd = price?.price;
      }
    } else {
      let price: any = await redisHandler.get(`price_${coin.id}`);
      if (price) (coin as any).currentPrice.usd = price?.price;
    }

    let exchangeData = [];
    if (coin.tradingMarkets && coin.tradingMarkets.length > 0) {
      try {
        const exchangeNames = [
          ...new Set(coin.tradingMarkets.map((market) => market.exchange)),
        ];
        const exchangeDataPromises = exchangeNames.map(async (exchangeName) => {
          const exchange = await prisma.exchange.findUnique({
            where: {
              name: exchangeName,
            },
            select: {
              name: true,
              logo: true,
              rank: true,
              spotVolumeUsd: true,
              slug: true,
            },
          });
          return exchange;
        });

        const exchanges = await Promise.all(exchangeDataPromises);

        exchangeData = coin.tradingMarkets.map((market) => {
          const exchangeInfo = exchanges.find(
            (e) => e?.name === market.exchange
          );
          return {
            ...market,
            logoUrl: exchangeInfo?.logo || null,
            slug: exchangeInfo?.slug || null,
          };
        });

        coin.tradingMarkets = exchangeData;
      } catch (error) {
        console.error("Error fetching exchange data:", error);
      }
    }

    // Fetch prediction data for SEO if coin has cmcId
    let predictionData = null;
    if (coin.cmcId) {
      try {
        console.log(
          `Fetching predictions for ${coin.cmcId} during static generation`
        );
        const predictionResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
          }/api/coin/prediction/${coin.cmcId}`,
          {
            headers: {
              "X-Precompute-Key":
                process.env.PRECOMPUTE_AUTH_KEY || "secure-precompute-key-123",
            },
          }
        );
        if (predictionResponse.ok) {
          predictionData = await predictionResponse.json();
        }
      } catch (error) {
        console.warn(`Failed to fetch predictions for ${coin.cmcId}:`, error);
      }
    }

    let serverData = {
      props: {
        coin: JSON.parse(JSON.stringify(coin)),
        topTokens: JSON.parse(JSON.stringify(topTokens)),
        exchangeData: JSON.parse(JSON.stringify(exchangeData)),
        predictionData: predictionData,
        initialSection: section,
        forcePredictionMode: isPrediction,
      },
      revalidate: 3600,
    };
    await redisHandler.set(
      `droomdroom_coin_${cleanSlug}`,
      JSON.stringify(serverData),
      { expirationTime: 60 * 60 }
    );
    return serverData;
  } catch (error) {
    console.error("Error in getStaticProps:", error);
    return {
      props: {
        coin: null,
        topTokens: [],
        exchangeData: [],
        predictionData: null,
        initialSection: section,
      },
      revalidate: 60,
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  if (process.env.SKIP_BUILD_STATIC_GENERATION === "true") {
    console.log(
      "Skipping static generation of token pages as requested by SKIP_BUILD_STATIC_GENERATION"
    );
    return {
      paths: [],
      fallback: "blocking",
    };
  }

  // Skip static generation if DATABASE_URL is not available (e.g., during Docker build)
  if (!process.env.DATABASE_URL) {
    console.log(
      "DATABASE_URL not found - skipping static generation, using fallback rendering"
    );
    return {
      paths: [],
      fallback: "blocking",
    };
  }

  const MAX_TOKENS = process.env.MAX_PRERENDER_TOKENS
    ? parseInt(process.env.MAX_PRERENDER_TOKENS)
    : 500;

  try {
    const tokens = await prisma.token.findMany({
      where: {
        rank: {
          not: null,
          lte: MAX_TOKENS,
        },
      },
      select: {
        slug: true,
        name: true,
        ticker: true,
      },
      orderBy: [{ rank: "asc" }],
      take: MAX_TOKENS,
    });

    console.log(
      `Pre-rendering ${tokens.length} token pages at build time (MAX_PRERENDER_TOKENS=${MAX_TOKENS})`
    );

    const standardPaths = tokens.map((token) => ({
      params: {
        slug: token.slug,
      },
    }));

    const predictionPaths = tokens.map((token) => ({
      params: {
        slug: `${token.slug}/prediction`,
      },
    }));

    const paths = [...standardPaths, ...predictionPaths];

    console.log(`Pre-rendering ${paths.length} total paths`);

    return {
      paths,
      fallback: "blocking",
    };
  } catch (error) {
    console.error("Database error during static path generation:", error);
    console.log("Falling back to runtime generation for all paths");
    return {
      paths: [],
      fallback: "blocking",
    };
  }
};

const Coin = ({
  coin: initialCoin,
  topTokens = [],
  predictionData: initialPredictionData = null,
  initialSection = null,
}: CoinProps) => {
  const router = useRouter();
  const { section: querySection } = router.query;

  const section =
    typeof querySection === "string" ? querySection : initialSection;

  const [coin, setCoin] = useState(initialCoin);
  const [originalCoin] = useState(initialCoin);
  const [activeSection, setActiveSection] = useState("chart");
  const [isSticky, setIsSticky] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const dataTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [loadingStates, setLoadingStates] = useState({
    mainData: false,
    priceData: false,
    chartData: false,
    marketData: false,
    similarCoins: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const sections = useRef<{ [key: string]: HTMLElement }>({});
  const { slug } = router.query;
  const [predictionData, setPredictionData] = useState<any>(
    initialPredictionData
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        setIsMobile(window.innerWidth < 768);

        const handleResize = () => {
          setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener("resize", handleResize);
        return () => {
          try {
            window.removeEventListener("resize", handleResize);
          } catch (error) {
            console.error("Error removing resize listener:", error);
          }
        };
      } catch (error) {
        console.error("Error setting up mobile detection:", error);
        setIsMobile(false);
      }
    }
  }, []);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setLoadingStates({
        mainData: true,
        priceData: true,
        chartData: true,
        marketData: true,
        similarCoins: true,
      });
      setLoadError(null);
    };

    const handleRouteChangeComplete = (url: string) => {
      const urlPath = url.split("?")[0];
      const parts = urlPath.split("/");
      const newSlug = parts[parts.length - 1];

      if (newSlug && typeof newSlug === "string") {
        const currentCoinSlug =
          coin?.name && coin?.ticker
            ? `${coin.name.toLowerCase()}-${coin.ticker.toLowerCase()}`
            : "";

        if (newSlug !== currentCoinSlug && newSlug !== slug) {
          fetchCoinData(newSlug, { preserveOnError: false });
        } else {
          setLoadingStates({
            mainData: false,
            priceData: false,
            chartData: false,
            marketData: false,
            similarCoins: false,
          });
        }
      } else {
        setLoadingStates({
          mainData: false,
          priceData: false,
          chartData: false,
          marketData: false,
          similarCoins: false,
        });
      }
    };

    const handleRouteChangeError = () => {
      setLoadingStates({
        mainData: false,
        priceData: false,
        chartData: false,
        marketData: false,
        similarCoins: false,
      });
      setLoadError("Navigation failed");
      if (originalCoin) {
        setCoin(originalCoin);
      }
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeError);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeError);
    };
  }, [router, slug, coin?.name, coin?.ticker, coin?.id, originalCoin]);

  const fetchPrice = useCallback(async () => {
    try {
      if (!coin?.cmcId) return;

      const response = await fetch(`${getApiUrl(`/coin/price/${coin.cmcId}`)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data) {
        console.warn("No price data received from API");
        return;
      }

      setCoin((prevCoin) => {
        if (!prevCoin) return prevCoin;

        return {
          ...prevCoin,
          currentPrice: {
            ...prevCoin.currentPrice,
            usd: data.price || prevCoin.currentPrice?.usd,
          },
          priceChanges: {
            ...prevCoin.priceChanges,
            day1: data.price_change_24h || prevCoin.priceChanges?.day1,
          },
          marketData: {
            ...prevCoin.marketData,
            volume24h: data.volume || prevCoin.marketData?.volume24h,
            volumeChange24h:
              data.volume_change_24h || prevCoin.marketData?.volumeChange24h,
            marketCap: data.market_cap || prevCoin.marketData?.marketCap,
          },
        };
      });
    } catch (error) {
      console.error("Error fetching price:", error);
    }
  }, [coin?.cmcId]);

  useEffect(() => {
    if (!coin?.cmcId) return;

    fetchPrice();

    const intervalId = setInterval(fetchPrice, 5000);

    return () => clearInterval(intervalId);
  }, [coin?.cmcId, fetchPrice]);

  useEffect(() => {
    return () => {
      if (dataTimerRef.current) {
        clearTimeout(dataTimerRef.current);
      }
    };
  }, []);

  const fetchCoinData = async (
    slugToFetch = slug,
    options = { preserveOnError: true }
  ) => {
    if (!slugToFetch || typeof slugToFetch !== "string") {
      console.warn("Invalid slug provided to fetchCoinData");
      setLoadingStates({
        mainData: false,
        priceData: false,
        chartData: false,
        marketData: false,
        similarCoins: false,
      });
      return;
    }
    if (!slugToFetch) return;

    if (dataTimerRef.current) clearTimeout(dataTimerRef.current);

    setLoadingStates({
      mainData: true,
      priceData: true,
      chartData: true,
      marketData: true,
      similarCoins: true,
    });

    setLoadError(null);

    try {
      let parsed;
      try {
        parsed = parseTokenSlug(String(slugToFetch));
      } catch (parseError) {
        console.error("Error parsing token slug:", parseError);
        setLoadError("Invalid coin format");
        setLoadingStates({
          mainData: false,
          priceData: false,
          chartData: false,
          marketData: false,
          similarCoins: false,
        });
        return;
      }
      if (!parsed) {
        throw new Error("Invalid coin format in URL");
      }

      console.log(`Fetching data for: ${parsed.ticker} (${parsed.name})`);

      try {
        const mainDataPromise = fetch(`${getApiUrl(`/coin/${slugToFetch}`)}`);

        const mainResponse = await mainDataPromise;
        if (!mainResponse.ok)
          throw new Error(`Main data API error: ${mainResponse.status}`);

        const freshData = await mainResponse.json();
        if (!freshData) throw new Error("No main data returned");

        setCoin((prevCoin) => ({
          ...prevCoin,
          ...freshData,
          name: freshData.name || prevCoin?.name,
          ticker: freshData.ticker || prevCoin?.ticker,
        }));

        setLoadingStates((prev) => ({ ...prev, mainData: false }));

        const cmcId = freshData.cmcId;

        if (cmcId) {
          const pricePromise = Promise.race([
            fetch(`${getApiUrl(`/coin/price/${cmcId}`)}`),
            new Promise<Response>((_, reject) =>
              setTimeout(() => reject(new Error("Price data timeout")), 3000)
            ),
          ])
            .then(async (response: Response) => {
              if (!response.ok)
                throw new Error(`Price API error: ${response.status}`);
              const priceData = await response.json();
              if (priceData?.price) {
                setCoin((prevCoin) => ({
                  ...prevCoin,
                  currentPrice: {
                    ...prevCoin?.currentPrice,
                    usd: priceData.price,
                  },
                  priceChanges: {
                    ...prevCoin?.priceChanges,
                    day1: priceData.price_change_24h,
                  },
                }));
              }
              setLoadingStates((prev) => ({ ...prev, priceData: false }));
            })
            .catch((err) => {
              console.warn("Price data error:", err);
              setLoadingStates((prev) => ({ ...prev, priceData: false }));
            });

          const chartPromise = Promise.race([
            fetch(`${getApiUrl(`/coin/chart/${cmcId}`)}`),
            new Promise<Response>((_, reject) =>
              setTimeout(() => reject(new Error("Chart data timeout")), 20000)
            ),
          ])
            .then(async (response: Response) => {
              if (!response.ok)
                throw new Error(`Chart API error: ${response.status}`);
              const chartData = await response.json();
              if (chartData) {
                setCoin((prevCoin) => ({
                  ...prevCoin,
                  history: chartData.history || prevCoin?.history,
                }));
              }
              setLoadingStates((prev) => ({ ...prev, chartData: false }));
            })
            .catch((err) => {
              console.warn("Chart data error:", err);
              setLoadingStates((prev) => ({ ...prev, chartData: false }));
            });

          pricePromise;
          chartPromise;

          Promise.race([
            fetch(`${getApiUrl(`/coin/similar/${cmcId}`)}`),
            new Promise<Response>((_, reject) =>
              setTimeout(() => reject(new Error("Similar coins timeout")), 4000)
            ),
          ])
            .then(() => {
              setLoadingStates((prev) => ({ ...prev, similarCoins: false }));
            })
            .catch(() => {
              setLoadingStates((prev) => ({ ...prev, similarCoins: false }));
            });
        }
      } catch (mainError) {
        console.error("Error loading data:", mainError);
        setLoadError("Failed to load coin data");

        if (options.preserveOnError && originalCoin) {
          setCoin(originalCoin);
        }

        setLoadingStates({
          mainData: false,
          priceData: false,
          chartData: false,
          marketData: false,
          similarCoins: false,
        });
      }
    } catch (error) {
      console.error("Error parsing slug:", error);
      setLoadError(
        error instanceof Error ? error.message : "Failed to load data"
      );

      setLoadingStates({
        mainData: false,
        priceData: false,
        chartData: false,
        marketData: false,
        similarCoins: false,
      });

      if (options.preserveOnError && originalCoin) {
        setCoin(originalCoin);
      }
    }
  };

  const currentSlugRef = useRef<string>();

  useEffect(() => {
    if (slug && typeof slug === "string" && slug !== currentSlugRef.current) {
      currentSlugRef.current = slug;
      fetchCoinData(slug);
    }
  }, [slug]);

  useEffect(() => {
    if (!coin?.cmcId) return;

    fetchPrice();

    const intervalId = setInterval(fetchPrice, 5000);

    return () => clearInterval(intervalId);
  }, [coin?.cmcId, fetchPrice]);

  const sectionIds = {
    chart: "chart",
    markets: "markets",
    about: "about",
    prediction: "prediction",
    converter: "converter",
    tokenomics: "tokenomics",
    fomo: "fomo",
    faq: "faq",
  };

  useEffect(() => {
    if (typeof document === "undefined") return;

    sections.current = {
      chart: document.getElementById(sectionIds.chart) as HTMLElement,
      markets: document.getElementById(sectionIds.markets) as HTMLElement,
      about: document.getElementById(sectionIds.about) as HTMLElement,
      prediction: document.getElementById(sectionIds.prediction) as HTMLElement,
      converter: document.getElementById(sectionIds.converter) as HTMLElement,
      tokenomics: document.getElementById(sectionIds.tokenomics) as HTMLElement,
      fomo: document.getElementById(sectionIds.fomo) as HTMLElement,
      faq: document.getElementById(sectionIds.faq) as HTMLElement,
    };

    const handleScroll = () => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        setIsSticky(containerRect.top <= 0);

        const scrollPosition = window.scrollY + window.innerHeight / 3;
        let currentSection = "chart";

        Object.entries(sections.current).forEach(([id, element]) => {
          if (element) {
            const { top, bottom } = element.getBoundingClientRect();
            const elementTop = top + window.scrollY;
            const elementBottom = bottom + window.scrollY;

            if (
              scrollPosition >= elementTop &&
              scrollPosition < elementBottom
            ) {
              currentSection = id;
            }
          }
        });

        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [
    sectionIds.about,
    sectionIds.chart,
    sectionIds.converter,
    sectionIds.faq,
    sectionIds.markets,
    sectionIds.prediction,
  ]);

  const handleHashChange = React.useCallback(() => {
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    const hash = window.location.hash.slice(1);
    if (hash) {
      setActiveSection(hash);
      const section = document.getElementById(hash);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      setActiveSection("chart");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [handleHashChange]);

  useEffect(() => {
    const fetchPredictions = async () => {
      // Only fetch if we don't have initial prediction data and have a cmcId
      if (!coin?.cmcId || initialPredictionData) {
        return;
      }

      try {
        const response = await fetch(
          getApiUrl(`/coin/prediction/${coin.cmcId}`)
        );

        if (!response.ok) {
          throw new Error("Failed to fetch predictions");
        }

        const data = await response.json();
        setPredictionData(
          data.predictions || {
            threeDay: null,
            fiveDay: null,
            oneMonth: null,
            threeMonth: null,
            sixMonth: null,
            oneYear: null,
          }
        );
      } catch (error) {
        console.error("Error fetching predictions:", error);
      }
    };

    fetchPredictions();
  }, [coin?.cmcId, initialPredictionData]);

  const getOgImageUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://droomdroom.com";
    if (!coin.cmcId) {
      return `${baseUrl}/HomePageSocialSnippet.png`;
    }
    return `${baseUrl}/api/og-image/${coin.id}`;
  };

  const ogImageUrl = getOgImageUrl();

  let schemaDescription = `${coin.name} (${coin.ticker}) cryptocurrency price, market cap, and trading data.`;
  let coinDesc = JSON.parse(coin.description! || "{}");
  if (coinDesc && Object.keys(coinDesc).length > 0) {
    let val = Object.values(coinDesc)[0] as any;
    if (typeof val === "string") {
      schemaDescription = val;
    } else if (val && val["a"]) {
      schemaDescription = val["a"];
    }
  }

  const cryptoSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name: coin.name,
    description: schemaDescription,
    category: getCategoryString(coin),
    url: getPageUrl(coin.slug),
    image: ogImageUrl,
    logo: ogImageUrl,
    brand: {
      "@type": "Brand",
      name: coin.name,
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: coin.currentPrice.usd,
      highPrice: coin.currentPrice.usd,
      offerCount: "1",
      availability: "https://schema.org/InStock",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Ticker Symbol",
        value: coin.ticker,
      },
      {
        "@type": "PropertyValue",
        name: "Price",
        value: coin.currentPrice.usd,
        unitText: "$",
      },
      {
        "@type": "PropertyValue",
        name: "Price Change (24 hours)",
        value: coin.priceChanges.day1,
        unitText: "%",
      },
      {
        "@type": "PropertyValue",
        name: "Market Cap",
        value: coin.marketData.marketCap,
        unitCode: "USD",
      },
      {
        "@type": "PropertyValue",
        name: "24h Volume",
        value: coin.marketData.volume24h,
        unitCode: "USD",
      },
      {
        "@type": "PropertyValue",
        name: "Circulating Supply",
        value: coin.marketData.circulatingSupply,
        unitText: coin.ticker,
      },
      {
        "@type": "PropertyValue",
        name: "Volume-to-Market-Cap Ratio",
        value:
          coin.marketData.volume24h && coin.marketData.marketCap
            ? (coin.marketData.volume24h / coin.marketData.marketCap).toFixed(6)
            : "0.00000",
        unitText: "ratio",
      },
      {
        "@type": "PropertyValue",
        name: "Rank",
        value: coin.rank || 0,
      },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: getPageUrl(`/${coin.slug}`),
    name: `${capitalize(coin.name)} (${
      coin.ticker
    }) Price Prediction 2025–2055`,
    description: `Discover expert short - and medium-term technical price prediction analysis of ${coin.name} (${coin.ticker}), along with long-term price forecasts for 2025, 2030, and beyond.`,
    mainEntity: {
      "@type": "FinancialProduct",
      name: coin.name,
      description: schemaDescription,
      url: getPageUrl(`/${coin.slug}`),
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DroomDroom",
    url: `${process.env.NEXT_PUBLIC_DOMAIN}`,
  };

  const faqs = getFAQsForCoin(coin.name, coin.ticker, predictionData);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer.replace(/<[^>]*>/g, ""),
      },
    })),
  };

  const combinedSchema = [
    webPageSchema,
    cryptoSchema,
    organizationSchema,
    faqSchema,
  ];

  if (!coin?.name || !coin?.ticker) {
    return (
      <CoinMainWrapper>
        <Container>
          <h1>No data available for this coin</h1>
          {loadingStates.mainData ? (
            <LoaderWrapper>
              <LoaderContent>
                <LoaderShimmer />
              </LoaderContent>
              <h2>Loading coin data...</h2>
            </LoaderWrapper>
          ) : (
            <>
              <p>
                We couldn&apos;t find data for this coin. The slug might be
                incorrect or the coin is not in our database.
              </p>
              {loadError && <p style={{ color: "red" }}>{loadError}</p>}
              <button
                onClick={() => {
                  if (slug) {
                    fetchCoinData(String(slug));
                  }
                }}
                style={{
                  padding: "10px 20px",
                  background: "#3861FB",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginTop: "20px",
                }}
              >
                Retry
              </button>
            </>
          )}
        </Container>
      </CoinMainWrapper>
    );
  }

  const getSafeSEOContent = () => {
    const hasValidData = coin && coin.name && coin.ticker && !loadError;

    // Generate prediction-rich content for SEO
    let predictionContent = "";
    let technicalAnalysis = "";

    if (predictionData && predictionData.predictions) {
      const predictions = predictionData.predictions;

      // Create detailed prediction text for SEO
      const shortTermPredictions = [];
      const longTermPredictions = [];

      if (predictions.threeDay) {
        shortTermPredictions.push(
          `3-day forecast: $${formatCryptoPrice(predictions.threeDay.price)} (${
            predictions.threeDay.roi > 0 ? "+" : ""
          }${predictions.threeDay.roi.toFixed(1)}%)`
        );
      }
      if (predictions.oneMonth) {
        shortTermPredictions.push(
          `1-month projection: $${formatCryptoPrice(
            predictions.oneMonth.price
          )} (${
            predictions.oneMonth.roi > 0 ? "+" : ""
          }${predictions.oneMonth.roi.toFixed(1)}%)`
        );
      }
      if (predictions.oneYear) {
        longTermPredictions.push(
          `2025 forecast: $${formatCryptoPrice(predictions.oneYear.price)} (${
            predictions.oneYear.roi > 0 ? "+" : ""
          }${predictions.oneYear.roi.toFixed(1)}% ROI)`
        );
      }

      predictionContent = [
        ...shortTermPredictions,
        ...longTermPredictions,
      ].join(", ");

      // Add technical analysis if available
      if (predictionData.technicalIndicators) {
        const indicators = predictionData.technicalIndicators;
        technicalAnalysis = `Technical analysis shows RSI at ${
          indicators.rsi14?.toFixed(1) || "N/A"
        }, ${indicators.fearGreedZone || "Neutral"} market sentiment`;
      }
    }

    const safeTitle = hasValidData
      ? `${capitalize(coin.name)} (${
          coin.ticker
        }) Price Prediction 2025, 2026-2055 | DroomDroom`
      : "Price Prediction 2025, 2026-2055 | DroomDroom";

    const baseDescription = hasValidData
      ? `Latest ${coin.name} price prediction analysis across short, medium, and long-term horizons, including detailed forecasts for 2025, 2030, and the years ahead.`
      : "Latest cryptocurrency price prediction analysis across short, medium, and long-term horizons, including detailed forecasts for 2025, 2030, and the years ahead.";

    // Enhance description with prediction data
    const enhancedDescription = predictionContent
      ? `${baseDescription} ${predictionContent}. ${technicalAnalysis}`
      : baseDescription;

    const safeKeywords = hasValidData
      ? `${coin.name}, ${coin.ticker}, price prediction, cryptocurrency forecast, ${coin.name} prediction, crypto analysis, technical analysis, market outlook, 2025 forecast, ${coin.ticker} price target, blockchain analysis`
      : "cryptocurrency, crypto price prediction, bitcoin forecast, ethereum analysis, crypto market outlook, blockchain, digital assets";

    // Create safe canonical URL
    const safeCanonical = hasValidData
      ? getPageUrl(`/${coin.slug}`)
      : coin?.name && coin?.ticker
      ? getPageUrl(`/${coin.slug}`)
      : getPageUrl("/");

    // Create safe og image
    const safeOgImage = hasValidData
      ? `${
          process.env.NEXT_PUBLIC_URL || "https://droomdroom.com"
        }/api/og-image/prediction/${coin.id}`
      : DEFAULT_OG_IMAGE;

    return {
      title: safeTitle,
      description: enhancedDescription,
      keywords: safeKeywords,
      canonical: safeCanonical,
      ogImage: safeOgImage,
      predictionContent,
      technicalAnalysis,
    };
  };

  const seoContent = getSafeSEOContent();

  // Generate SEO-optimized prediction summary for crawlers
  const renderPredictionSummary = () => {
    if (!predictionData || !predictionData.predictions) return null;

    const predictions = predictionData.predictions;

    return (
      <div style={{ display: "none" }} id="seo-prediction-content">
        <h1>
          {coin.name} ({coin.ticker}) Price Prediction Analysis 2025-2055
        </h1>

        <h2>Short-term Price Forecasts</h2>
        {predictions.threeDay && (
          <p>
            Our 3-day {coin.name} prediction indicates a target price of $
            {formatCryptoPrice(predictions.threeDay.price)}, representing a{" "}
            {predictions.threeDay.roi > 0
              ? "potential gain"
              : "potential decline"}{" "}
            of {Math.abs(predictions.threeDay.roi).toFixed(1)}%. The confidence
            level for this short-term forecast is{" "}
            {predictions.threeDay.confidence}%, with market sentiment showing{" "}
            {predictions.threeDay.sentiment} indicators.
          </p>
        )}

        {predictions.oneMonth && (
          <p>
            The 1-month {coin.name} price prediction projects a value of $
            {formatCryptoPrice(predictions.oneMonth.price)}, suggesting{" "}
            {predictions.oneMonth.roi > 0 ? "bullish" : "bearish"} momentum with
            an expected ROI of {predictions.oneMonth.roi.toFixed(1)}%.
          </p>
        )}

        <h2>Long-term Investment Outlook</h2>
        {predictions.oneYear && (
          <p>
            Looking ahead to 2025, our comprehensive analysis suggests{" "}
            {coin.name} could reach $
            {formatCryptoPrice(predictions.oneYear.price)}, representing a
            significant{" "}
            {predictions.oneYear.roi > 0
              ? "growth opportunity"
              : "market correction"}{" "}
            of {Math.abs(predictions.oneYear.roi).toFixed(1)}%. This long-term
            forecast considers market cycles, adoption trends, and technical
            fundamentals.
          </p>
        )}

        {predictionData.technicalIndicators && (
          <>
            <h2>Technical Analysis Summary</h2>
            <p>
              Current technical indicators for {coin.name} show an RSI of{" "}
              {predictionData.technicalIndicators.rsi14?.toFixed(1) || "N/A"},
              indicating{" "}
              {predictionData.technicalIndicators.rsi14 > 70
                ? "overbought"
                : predictionData.technicalIndicators.rsi14 < 30
                ? "oversold"
                : "balanced"}{" "}
              conditions. The Fear & Greed Index reflects{" "}
              {predictionData.technicalIndicators.fearGreedZone} sentiment in
              the market. Recent performance shows{" "}
              {predictionData.technicalIndicators.greenDays} positive trading
              days,
              {predictionData.technicalIndicators.isProfitable
                ? "suggesting favorable"
                : "indicating mixed"}{" "}
              market conditions for investment.
            </p>
          </>
        )}

        <h2>Investment Considerations</h2>
        <p>
          These {coin.name} price predictions are based on comprehensive
          technical analysis, market trends, and algorithmic modeling.
          Cryptocurrency investments carry inherent risks, and past performance
          does not guarantee future results. Consider your risk tolerance and
          conduct additional research before making investment decisions.
        </p>
      </div>
    );
  };

  return (
    <div>
      <SEO
        title={seoContent.title}
        description={seoContent.description}
        keywords={seoContent.keywords}
        ogType="website"
        ogImage={seoContent.ogImage}
        canonical={seoContent.canonical}
        structuredData={combinedSchema}
      />
      {renderPredictionSummary()}
      {!isMobile ? (
        <ErrorBoundary>
          <CoinPageContainerWrapper ref={containerRef}>
            <ErrorBoundary
              fallback={
                <div className="left-sidebar-error">
                  Unable to load left sidebar content
                </div>
              }
            >
              <CoinLeftSidebar
                coin={coin}
                isSticky={isSticky}
                loading={false}
              />
            </ErrorBoundary>

            <ErrorBoundary
              fallback={
                <div className="main-content-error">
                  Unable to load main content
                </div>
              }
            >
              <CoinMainContent
                coin={coin}
                topTokens={topTokens || []}
                sectionIds={sectionIds}
                isNavSticky={isSticky}
              />
            </ErrorBoundary>

            <ErrorBoundary
              fallback={
                <div className="right-sidebar-error">
                  Unable to load right sidebar content
                </div>
              }
            >
              <CoinRightSidebar
                coin={{ ...coin, cmdId: coin?.cmcId }}
                isStick={isSticky}
              />
            </ErrorBoundary>
          </CoinPageContainerWrapper>
        </ErrorBoundary>
      ) : (
        <ErrorBoundary
          fallback={
            <div className="mobile-error">Unable to load mobile content</div>
          }
        >
          <MobileCoin coin={coin} topTokens={topTokens || []} />
        </ErrorBoundary>
      )}
    </div>
  );
};

// Wrap the entire component with error boundary for top-level protection
const SafeCoin = (props: CoinProps) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<ComponentLoader />}>
        <Coin {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default SafeCoin;

const ComponentLoader = () => (
  <LoaderWrapper>
    <LoaderContent>
      <LoaderShimmer />
    </LoaderContent>
  </LoaderWrapper>
);

const CoinPageContainerWrapper = styled.div`
  display: flex;
  width: 100%;
  position: relative;
  min-height: 100vh;
  background: ${(props) => props.theme.colors.background};
  margin: 0 auto;

  > *:first-child,
  > *:last-child {
    // Sidebars
    position: sticky;
    top: 0px;
    height: calc(100vh - 48px);
    overflow-y: auto;
    align-self: flex-start;
    z-index: 100;
  }

  > *:nth-child(2) {
    // Main content
    flex: 1;
    min-width: 0;
    position: relative;
  }

  @media (max-width: 1280px) {
    padding: 16px;
    gap: 16px;
    flex-direction: column;

    > *:first-child,
    > *:last-child {
      display: block;
      position: relative;
      top: 0;
      height: auto;
      width: 100%;
    }

    > *:first-child {
      // Left sidebar on mobile
      order: 1;
      margin-bottom: 16px;
    }

    > *:nth-child(2) {
      // Main content on mobile
      order: 2;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      margin: 16px 0;
      padding-bottom: 16px;
    }

    > *:last-child {
      // Right sidebar on mobile
      order: 3;
    }
  }

  @media (max-width: 768px) {
    padding: 12px;
    gap: 12px;

    > *:nth-child(2) {
      margin: 12px 0;
    }
  }
`;

const LoaderWrapper = styled.div`
  width: 100%;
  min-height: 200px;
  background: ${(props) => props.theme.colors.cardBackground};
  border-radius: 12px;
  overflow: hidden;
  position: relative;
`;

const LoaderContent = styled.div`
  width: 100%;
  height: 100%;
  background: ${(props) => props.theme.colors.backgroundHover};
  position: absolute;
  top: 0;
  left: 0;
`;

const LoaderShimmer = styled.div`
  width: 50%;
  height: 100%;
  background: linear-gradient(
    to right,
    transparent 0%,
    ${(props) => props.theme.colors.cardBackground} 50%,
    transparent 100%
  );
  animation: shimmer 1s infinite;
  position: absolute;
  top: 0;
  left: 0;

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(200%);
    }
  }
`;

const CoinMainWrapper = styled.div`
  padding: 16px 0;
  background: ${(props) => props.theme.colors.background};
  width: 100%;
  overflow-x: hidden;
`;
