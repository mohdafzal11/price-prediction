import React from 'react';
import {
  GuideWrapper,
  GuideTitle,
  GuideIntro,
  SectionTitle,
  SectionContent,
  PatternsContainer,
  PatternSection,
  PatternTitle,
  PatternList,
  PatternItem,
  Disclaimer
} from './PriceGuide.styled';

interface PriceGuideProps {
  onMouseEnter?: () => void;
  coinName?: string;
  coinTicker?: string;
}

const PriceGuide: React.FC<PriceGuideProps> = ({ 
  onMouseEnter, 
  coinName = "cryptocurrency", 
  coinTicker = "crypto" 
}) => {
  const bullishPatterns = [
    'Hammer - A single candle with small body and long lower wick, indicating buyers rejected lower prices',
    'Bullish Engulfing - A large green candle completely engulfs the previous red candle, showing strong buying pressure',
    'Morning Star - A three-candle pattern signaling a potential bottom formation and trend reversal',
    'Piercing Line - A two-candle pattern where a green candle closes above the midpoint of the previous red candle',
    'Three White Soldiers - Three consecutive green candles with higher highs and lows, demonstrating sustained buying'
  ];

  const bearishPatterns = [
    'Shooting Star - A candle with small body and long upper wick, suggesting sellers rejected higher prices',
    'Evening Star - A three-candle pattern indicating a potential top formation and trend reversal',
    'Bearish Engulfing - A large red candle completely engulfs the previous green candle, signaling strong selling',
    'Dark Cloud Cover - A two-candle pattern where a red candle opens above but closes below the midpoint of the previous green',
    'Hanging Man - Similar to a hammer but appears during uptrends, potentially signaling a reversal'
  ];

  return (
    <>
    <GuideWrapper onMouseEnter={onMouseEnter}>
      <GuideTitle>{coinName} Price Analysis: Essential Tools and Techniques for Traders</GuideTitle>
      <GuideIntro>
        Understanding {coinName} price movements requires a sophisticated approach combining technical indicators, 
        chart patterns, and market sentiment analysis. This guide outlines the most effective tools and techniques 
        for analyzing {coinName} price action.
      </GuideIntro>
      
      <div>
        <SectionTitle>Key Technical Indicators for {coinName} Analysis</SectionTitle>
        <SectionContent>
          <strong>Moving Averages (MAs)</strong> smooth out price data to identify trends. The 50-day, 100-day, and 200-day 
          MAs are particularly important for {coinName} traders. When price crosses above these averages, it&apos;s generally 
          considered bullish; when it falls below, it&apos;s often seen as bearish.
        </SectionContent>
        <SectionContent>
          <strong>Relative Strength Index (RSI)</strong> measures the speed and change of price movements on a scale of 0-100. 
          For {coinName}, RSI readings above 70 typically indicate overbought conditions, while readings below 30 suggest 
          oversold conditions that may precede a reversal.
        </SectionContent>
        <SectionContent>
          <strong>MACD (Moving Average Convergence Divergence)</strong> helps identify changes in momentum by showing the relationship 
          between two moving averages. When the MACD line crosses above the signal line, it&apos;s a potential buy signal; when it crosses 
          below, it may indicate a selling opportunity.
        </SectionContent>
        <SectionContent>
          <strong>Bollinger Bands</strong> consist of a middle band (20-day SMA) with upper and lower bands set at standard deviations 
          from the middle. These bands expand and contract with volatility, making them particularly useful for trading {coinName}&apos;s 
          characteristic volatility cycles.
        </SectionContent>
        <SectionContent>
          <strong>Fibonacci Retracement Levels</strong> help identify potential support and resistance levels based on key ratios. 
          These levels (23.6%, 38.2%, 50%, 61.8%, and 78.6%) often mark areas where {coinName} price may reverse direction during 
          corrections or rallies.
        </SectionContent>
      </div>

      <PatternsContainer>
        <PatternSection>
          <PatternTitle $type="bullish">
            Essential Bullish Candlestick Patterns for {coinName} Trading
          </PatternTitle>
          <PatternList>
            {bullishPatterns.map((pattern, index) => (
              <PatternItem key={index}>{pattern}</PatternItem>
            ))}
          </PatternList>
        </PatternSection>

        <PatternSection>
          <PatternTitle $type="bearish">
            Critical Bearish Candlestick Patterns to Watch in {coinName} Markets
          </PatternTitle>
          <PatternList>
            {bearishPatterns.map((pattern, index) => (
              <PatternItem key={index}>{pattern}</PatternItem>
            ))}
          </PatternList>
        </PatternSection>
      </PatternsContainer>

      <div>
        <SectionTitle>Support and Resistance Levels in {coinName} Trading</SectionTitle>
        <SectionContent>
          Support and resistance levels represent price points where {coinName} has historically reversed direction. 
          These levels are critical for setting entry points, profit targets, and stop-loss orders.
        </SectionContent>
        <SectionContent>
          <strong>Support levels</strong> are price zones where buying pressure has previously overcome selling pressure, 
          causing the price to bounce. These areas often represent good buying opportunities with defined risk.
        </SectionContent>
        <SectionContent>
          <strong>Resistance levels</strong> are price zones where selling pressure has previously overcome buying pressure, 
          causing the price to decline. Breakouts above resistance often signal continued upward momentum.
        </SectionContent>
        <SectionContent>
          Traders identify these levels through:
          <ul>
            <li>Previous price highs and lows</li>
            <li>Trendlines connecting multiple price points</li>
            <li>Moving averages acting as dynamic support/resistance</li>
            <li>Round psychological numbers (e.g., $10,000, $50,000)</li>
          </ul>
        </SectionContent>
      </div>

    </GuideWrapper>
    <GuideWrapper>

        {/* <SectionTitle>Practical Tips for Investors to Efficiently Use {coinName} Price Predictions</SectionTitle> */}
      <GuideTitle>Practical Tips for Investors to Efficiently Use {coinName} Price Predictions</GuideTitle>
        <SectionContent>
          Price predictions are tools that investors can leverage for better and more informed decision-making, but they are not guarantees at all. Here&apos;s how to leverage them:
        </SectionContent>
        <SectionContent>
          <ul>
            <li><strong>Short-Term Trading:</strong> Use daily/weekly forecasts to set entry/exit points with stop-losses</li>
            <li><strong>Long-Term Holding:</strong> Focus on 2025–2030 targets for HODLing strategies</li>
            <li><strong>Dollar-Cost Averaging (DCA):</strong> Invest fixed amounts regularly to mitigate volatility</li>
            <li><strong>Risk Management:</strong> Never invest more than you can lose and also diversify your portfolio with altcoins or stables</li>
            <li><strong>Sentiment Check:</strong> Cross-reference our Fear & Greed Index (28 now) with X feeds for timing</li>
          </ul>
        </SectionContent>
        <Disclaimer>
        <h3>DISCLAIMER: Not Investment Advice</h3>
        <p>
          The information provided is for general information purposes only. No information, materials, services, or content provided 
          constitutes solicitation, recommendation, endorsement, or any financial, investment, or other advice. Seek independent 
          professional consultation before making any investment decision.
        </p>
      </Disclaimer>
      </GuideWrapper>
    </>
  );
};

export default PriceGuide; 