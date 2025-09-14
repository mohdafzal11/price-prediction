import { NextApiRequest, NextApiResponse } from 'next';
import { getApiUrl } from 'utils/config';
import { redisHandler } from 'utils/redis';

interface SentimentData {
  bullishPercent: number;
  bearishPercent: number;
  bullishIndicators: number;
  bearishIndicators: number;
  lastUpdated: string;
  technicalSummary: string;
}

// Calculate sentiment based on technical indicators
const calculateSentiment = async (id: string): Promise<SentimentData> => {
  try {
    // Fetch price data to use for calculations
    const priceResponse = await fetch(getApiUrl(`/coin/price/${id}`));
    if (!priceResponse.ok) {
      throw new Error('Failed to fetch price data');
    }
    const priceData = await priceResponse.json();
    // console.log(priceData);
    
    // Fetch chart data for technical analysis
    const chartResponse = await fetch(getApiUrl(`/coin/chart/${id}`));
    if (!chartResponse.ok) {
      throw new Error('Failed to fetch chart data');
    }
    const chartData = await chartResponse.json();
    
    // Extract prices for technical analysis
    const prices = chartData.map((point: any) => point.price);
    const volumes = chartData.map((point: any) => point.volume || 0);
    
    // Calculate various technical indicators
    const indicators: { [key: string]: boolean } = {};
    
    // 1. Moving Averages
    const sma20 = calculateSMA(prices, 20);
    const sma50 = calculateSMA(prices, 50);
    const sma200 = calculateSMA(prices, 200);
    
    indicators['SMA20 > SMA50'] = sma20[sma20.length - 1] > sma50[sma50.length - 1];
    indicators['SMA50 > SMA200'] = sma50[sma50.length - 1] > sma200[sma200.length - 1];
    indicators['Price > SMA20'] = prices[prices.length - 1] > sma20[sma20.length - 1];
    indicators['Price > SMA50'] = prices[prices.length - 1] > sma50[sma50.length - 1];
    indicators['Price > SMA200'] = prices[prices.length - 1] > sma200[sma200.length - 1];
    
    // 2. RSI
    const rsi = calculateRSI(prices);
    indicators['RSI < 30 (Oversold)'] = rsi[rsi.length - 1] < 30;
    indicators['RSI > 70 (Overbought)'] = rsi[rsi.length - 1] > 70;
    
    // 3. MACD
    const { macd, signal } = calculateMACD(prices);
    indicators['MACD > Signal'] = macd[macd.length - 1] > signal[signal.length - 1];
    
    // 4. Bollinger Bands
    const { upper, middle, lower } = calculateBollingerBands(prices);
    indicators['Price > Upper Band'] = prices[prices.length - 1] > upper[upper.length - 1];
    indicators['Price < Lower Band'] = prices[prices.length - 1] < lower[lower.length - 1];
    
    // 5. Volume trends
    const avgVolume = volumes.slice(-10).reduce((sum, vol) => sum + vol, 0) / 10;
    indicators['Volume > Avg Volume'] = volumes[volumes.length - 1] > avgVolume;
    
    // 6. Price momentum
    indicators['Price Up 3 Days'] = 
      prices[prices.length - 1] > prices[prices.length - 2] && 
      prices[prices.length - 2] > prices[prices.length - 3] && 
      prices[prices.length - 3] > prices[prices.length - 4];
    
    indicators['Price Down 3 Days'] = 
      prices[prices.length - 1] < prices[prices.length - 2] && 
      prices[prices.length - 2] < prices[prices.length - 3] && 
      prices[prices.length - 3] < prices[prices.length - 4];
    
    // 7. Support/Resistance
    const { support, resistance } = findSupportResistanceLevels(prices);
    const nearestSupport = support.length > 0 ? 
      support.reduce((prev, curr) => Math.abs(curr - prices[prices.length - 1]) < Math.abs(prev - prices[prices.length - 1]) ? curr : prev, support[0]) : 
      prices[prices.length - 1] * 0.8;
    
    const nearestResistance = resistance.length > 0 ? 
      resistance.reduce((prev, curr) => Math.abs(curr - prices[prices.length - 1]) < Math.abs(prev - prices[prices.length - 1]) ? curr : prev, resistance[0]) : 
      prices[prices.length - 1] * 1.2;
    
    indicators['Price Near Support'] = Math.abs(prices[prices.length - 1] - nearestSupport) / prices[prices.length - 1] < 0.05;
    indicators['Price Near Resistance'] = Math.abs(prices[prices.length - 1] - nearestResistance) / prices[prices.length - 1] < 0.05;
    
    // Calculate 24h and 7d price changes from chart data if available
    let percent_change_24h = 0;
    let percent_change_7d = 0;
    
    if (prices.length >= 2) {
      // Calculate 24h change from the last two data points
      percent_change_24h = ((prices[prices.length - 1] - prices[prices.length - 2]) / prices[prices.length - 2]) * 100;
    }
    
    if (prices.length >= 8) {
      // Calculate 7d change from data points 7 days apart
      percent_change_7d = ((prices[prices.length - 1] - prices[prices.length - 8]) / prices[prices.length - 8]) * 100;
    }
    
    // 8. Price changes - use our calculated values instead of priceData
    indicators['24h Change Positive'] = percent_change_24h > 0;
    indicators['7d Change Positive'] = percent_change_7d > 0;
    
    // Count bullish and bearish indicators
    let bullishCount = 0;
    let bearishCount = 0;
    
    // Define which indicators are bullish when true
    const bullishWhenTrue = [
      'SMA20 > SMA50', 
      'SMA50 > SMA200', 
      'Price > SMA20', 
      'Price > SMA50', 
      'Price > SMA200',
      'MACD > Signal',
      'Price < Lower Band',
      'Volume > Avg Volume',
      'Price Up 3 Days',
      'Price Near Support',
      '24h Change Positive',
      '7d Change Positive'
    ];
    
    // Define which indicators are bearish when true
    const bearishWhenTrue = [
      'RSI > 70 (Overbought)',
      'Price > Upper Band',
      'Price Down 3 Days',
      'Price Near Resistance'
    ];
    
    // Special case for RSI < 30 which can be both (oversold can mean buying opportunity)
    if (indicators['RSI < 30 (Oversold)']) {
      bullishCount += 1; // Potential buying opportunity
    }
    
    // Count the indicators
    for (const indicator of bullishWhenTrue) {
      if (indicators[indicator]) {
        bullishCount += 1;
      } else {
        bearishCount += 1;
      }
    }
    
    for (const indicator of bearishWhenTrue) {
      if (indicators[indicator]) {
        bearishCount += 1;
      } else {
        bullishCount += 1;
      }
    }
    
    // Calculate percentages
    const total = bullishCount + bearishCount;
    const bullishPercent = Math.round((bullishCount / total) * 100);
    const bearishPercent = 100 - bullishPercent;
    
    // Generate a technical summary
    let technicalSummary = "neutral";
    if (bullishPercent >= 70) {
      technicalSummary = "strongly bullish";
    } else if (bullishPercent >= 55) {
      technicalSummary = "moderately bullish";
    } else if (bullishPercent >= 45) {
      technicalSummary = "neutral";
    } else if (bullishPercent >= 30) {
      technicalSummary = "moderately bearish";
    } else {
      technicalSummary = "strongly bearish";
    }
    
    return {
      bullishPercent,
      bearishPercent,
      bullishIndicators: bullishCount,
      bearishIndicators: bearishCount,
      lastUpdated: new Date().toISOString(),
      technicalSummary
    };
  } catch (error) {
    console.error('Error calculating sentiment:', error);
    // Return default values if calculation fails
    return {
      bullishPercent: 50,
      bearishPercent: 50,
      bullishIndicators: 10,
      bearishIndicators: 10,
      lastUpdated: new Date().toISOString(),
      technicalSummary: "neutral"
    };
  }
};

// Helper functions for technical indicators
function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
      continue;
    }
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(Math.max(0, change));
    losses.push(Math.max(0, -change));
  }

  // Calculate average gains and losses
  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      rsi.push(NaN);
      continue;
    }

    const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }

  return rsi;
}

function calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): { macd: number[], signal: number[] } {
  const ema12 = calculateEMA(prices, fastPeriod);
  const ema26 = calculateEMA(prices, slowPeriod);
  
  const macdLine: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (isNaN(ema12[i]) || isNaN(ema26[i])) {
      macdLine.push(NaN);
    } else {
      macdLine.push(ema12[i] - ema26[i]);
    }
  }
  
  const signalLine = calculateEMA(macdLine.filter(val => !isNaN(val)), signalPeriod);
  
  // Pad signal line with NaN to match the length of macdLine
  const paddedSignalLine = Array(macdLine.length - signalLine.length).fill(NaN).concat(signalLine);
  
  return {
    macd: macdLine,
    signal: paddedSignalLine
  };
}

function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // Start with SMA for the first EMA value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
    ema.push(NaN);
  }
  
  ema[period - 1] = sum / period;
  
  // Calculate EMA for the rest of the values
  for (let i = period; i < prices.length; i++) {
    ema.push((prices[i] - ema[i - 1]) * multiplier + ema[i - 1]);
  }
  
  return ema;
}

function calculateBollingerBands(prices: number[], period: number = 20, multiplier: number = 2): { upper: number[], middle: number[], lower: number[] } {
  const middle = calculateSMA(prices, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      lower.push(NaN);
      continue;
    }

    const slice = prices.slice(i - period + 1, i + 1);
    const std = Math.sqrt(slice.reduce((sum, x) => sum + Math.pow(x - middle[i], 2), 0) / period);
    upper.push(middle[i] + (multiplier * std));
    lower.push(middle[i] - (multiplier * std));
  }

  return { upper, middle, lower };
}

function findSupportResistanceLevels(prices: number[], period: number = 20): { support: number[], resistance: number[] } {
  const support: number[] = [];
  const resistance: number[] = [];

  for (let i = period; i < prices.length - period; i++) {
    const windowPrices = prices.slice(i - period, i + period);
    const currentPrice = prices[i];

    // Check if current price is a local minimum (support)
    if (currentPrice <= Math.min(...windowPrices)) {
      support.push(currentPrice);
    }

    // Check if current price is a local maximum (resistance)
    if (currentPrice >= Math.max(...windowPrices)) {
      resistance.push(currentPrice);
    }
  }

  return { support, resistance };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  // console.log("sentiment api called");

  const { id } = req.query;
  const forceRefresh = req.query.refresh === 'true';

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid id parameter' });
  }

  try {
    // Check if we have cached sentiment data
    const cacheKey = `coin_sentiment_${id}`;
    
    if (!forceRefresh) {
      const cachedSentiment = await redisHandler.get(cacheKey);
      if (cachedSentiment) {
        return res.status(200).json(cachedSentiment);
      }
    }
    
    // Calculate new sentiment data
    const sentimentData = await calculateSentiment(id);
    
    // Cache the sentiment data for 24 hours
    await redisHandler.set(cacheKey, sentimentData, { expirationTime: 24 * 60 * 60 });
    
    // Set cache control headers
    // res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    // no cache at all...
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    
    
    // Return the sentiment data
    return res.status(200).json(sentimentData);
  } catch (error) {
    console.error('Error in sentiment API handler:', error);
    return res.status(500).json({ message: 'Error calculating sentiment' });
  }
} 