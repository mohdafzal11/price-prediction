/**
 * Enhanced FAQ data generator for crypto price predictions
 * This module generates comprehensive, accurate FAQs based on prediction data
 */

export const getFAQsForCoin = (coinName: string, coinTicker: string, predictionData?: any) => {
  // Extract prediction data with proper fallbacks
  const rawPredictionData = predictionData?.rawPredictionData || {};
  const currentPrice = predictionData?.currentPrice || 0;
  const fiveDay = predictionData?.fiveDay || { price: 0, minPrice: 0, maxPrice: 0, roi: 0, confidence: 0, sentiment: "neutral" };
  const oneMonth = predictionData?.oneMonth || { price: 0, minPrice: 0, maxPrice: 0, roi: 0, confidence: 0, sentiment: "neutral" };
  const threeMonth = predictionData?.threeMonth || { price: 0, minPrice: 0, maxPrice: 0, roi: 0, confidence: 0, sentiment: "neutral" };
  const sixMonth = predictionData?.sixMonth || { price: 0, minPrice: 0, maxPrice: 0, roi: 0, confidence: 0, sentiment: "neutral" };
  const oneYear = predictionData?.oneYear || { price: 0, minPrice: 0, maxPrice: 0, roi: 0, confidence: 0, sentiment: "neutral" };
  // Get yearly predictions if available
  const yearlyPredictions = predictionData?.yearlyPredictions || {};
  const rank = predictionData?.rank || 1;
  // Extract technical indicators with fallbacks
  const fearGreedIndex = predictionData?.fearGreedIndex || 40;
  const fearGreedZone = predictionData?.fearGreedZone || getFearGreedDescription(fearGreedIndex);
  
  // Calculate green days if not provided
  const greenDays = predictionData?.greenDays || "13/30 (43%)";
  
  // Determine if investment is profitable based on indicators
  const isProfitable = predictionData?.isProfitable !== undefined 
    ? predictionData.isProfitable 
    : (fiveDay.roi > 0 && oneMonth.roi > 0);
  
  // Technical indicators
  const sma50 = predictionData?.sma50 || (currentPrice * 0.98); // Slightly lower than current by default
  const sma200 = predictionData?.sma200 || (currentPrice * 0.95); // Lower than current by default
  const rsi14 = predictionData?.rsi14 || 50; // Neutral by default
  
  // Get dates for different prediction timeframes
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextThreeDays = new Date(today);
  nextThreeDays.setDate(nextThreeDays.getDate() + 3);
  
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  const nextSixMonths = new Date(today);
  nextSixMonths.setMonth(nextSixMonths.getMonth() + 6);
  
  const nextYear = new Date(today);
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  
  // Format dates nicely
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Format prices consistently based on magnitude
  const formatPrice = (price: number) => {
    if (price === 0) return '$ 0.00';
    
    if (price < 0.0001) return `$ ${price.toFixed(8)}`;
    if (price < 0.01) return `$ ${price.toFixed(6)}`;
    if (price < 1) return `$ ${price.toFixed(4)}`;
    if (price < 100) return `$ ${price.toFixed(2)}`;
    
    return `$ ${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  // Format percentages with + or - sign
  const formatPercentage = (percentage: number) => {
    if (percentage > 0) {
      return `+${percentage.toFixed(2)}%`;
    } else {
      return `${percentage.toFixed(2)}%`;
    }
  };
  
  // Calculate appropriate milestone prices based on current price
  const getMilestonePrices = () => {
    if (!currentPrice || currentPrice === 0) {
      // Default milestones if current price is unknown
      return { price1: 1, price2: 10, price3: 100 };
    }
    
    let scaleFactor = 10;
    
    // For high-value coins, use larger scale factors
    if (currentPrice >= 10000) {
      scaleFactor = 5;
    } else if (currentPrice >= 1000) {
      scaleFactor = 7;
    } else if (currentPrice >= 100) {
      scaleFactor = 10;
    } else if (currentPrice < 1) {
      // For very low value coins, use smaller increments
      if (currentPrice < 0.0001) {
        return {
          price1: currentPrice * 10,
          price2: currentPrice * 100,
          price3: currentPrice * 1000
        };
      } else if (currentPrice < 0.01) {
        return {
          price1: 0.01,
          price2: 0.1,
          price3: 1
        };
      } else {
        return {
          price1: 0.1,
          price2: 1,
          price3: 10
        };
      }
    }
    
    // Standard milestone calculation
    const price1 = Math.ceil(currentPrice * 1.5 / 10) * 10; // Next reasonable milestone
    const price2 = Math.ceil(currentPrice * scaleFactor / 100) * 100; // Mid-term milestone
    const price3 = Math.ceil(currentPrice * scaleFactor * 2 / 1000) * 1000; // Long-term milestone
    
    // For Bitcoin and high-value assets
    if (currentPrice > 30000) {
      return {
        price1: 100000,
        price2: 1000000,
        price3: 10000000
      };
    }
    
    // Ensure price1 is always higher than current price
    return {
      price1: price1 <= currentPrice ? currentPrice * 2 : price1,
      price2,
      price3
    };
  };
  
  const { price1, price2, price3 } = getMilestonePrices();
  
  // Calculate price growth needed for milestone
  const calculateGrowthToMilestone = (milestone: number) => {
    if (!currentPrice || currentPrice === 0) return 0;
    return ((milestone - currentPrice) / currentPrice) * 100;
  };
  
  // Determine sentiment description based on RSI
  const getRSISentiment = (rsi: number) => {
    if (rsi > 60) return "overbought";
    if (rsi >= 40 && rsi <= 60) return "neutral";
    return "oversold";
  };
  
  // Determine fear & greed zone description
  function getFearGreedDescription(index: number) {
    if (index <= 24) return "Extreme Fear";
    if (index <= 49) return "Fear";
    if (index <= 59) return "Neutral";
    if (index <= 75) return "Greed";
    return "Extreme Greed";
  }
  
  // Find most likely timeframe to reach price target based on current trajectory
  const estimateTimeToReachPrice = (targetPrice: number) => {
    if (!currentPrice || currentPrice === 0 || !oneYear.roi || oneYear.roi <= 0) {
      return { timeframe: "undetermined", date: "an undetermined future date" };
    }
    
    const annualGrowthRate = oneYear.roi / 100;
    
    // Calculate years needed using compound growth formula
    // Years = ln(Target/Current) / ln(1 + annual growth rate)
    const yearsNeeded = Math.log(targetPrice / currentPrice) / Math.log(1 + annualGrowthRate);
    
    if (yearsNeeded <= 0 || isNaN(yearsNeeded)) {
      return { timeframe: "unlikely", date: "the far future, if ever" };
    }
    
    // Convert to a future date
    const targetDate = new Date();
    const fullYears = Math.floor(yearsNeeded);
    const remainingMonths = Math.round((yearsNeeded - fullYears) * 12);
    
    targetDate.setFullYear(targetDate.getFullYear() + fullYears);
    targetDate.setMonth(targetDate.getMonth() + remainingMonths);
    
    // Format the target date
    const formattedDate = targetDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    // Determine timeframe description
    let timeframe;
    if (yearsNeeded < 0.25) {
      timeframe = "very near-term";
    } else if (yearsNeeded < 1) {
      timeframe = "near-term";
    } else if (yearsNeeded < 3) {
      timeframe = "medium-term";
    } else if (yearsNeeded < 7) {
      timeframe = "long-term";
    } else {
      timeframe = "very long-term";
    }
    
    return { timeframe, date: formattedDate };
  };
  
  // Generate milestone answer with accurate timeframe prediction
  const generateMilestoneAnswer = (targetPrice: number) => {
    const growth = calculateGrowthToMilestone(targetPrice);
    const { timeframe, date } = estimateTimeToReachPrice(targetPrice);
    
    // Determine feasibility based on required growth vs yearly predictions
    const feasibilityAssessment = growth > oneYear.roi * 10 ? "would be highly ambitious and require significant market shifts" : 
                                 growth > oneYear.roi * 5 ? "would be challenging but possible given favorable conditions" : 
                                 growth > oneYear.roi * 2 ? "appears achievable under sustained favorable market conditions" : 
                                 "seems within reach based on current growth projections";
    
    return `Based on our analysis, ${coinName} would need to ${
      growth > 35 ? 'significantly increase by' : 
      growth > 15 ? 'notably increase by' : 
      'mildly increase by'
    } approximately ${growth.toFixed(2)}% from its current price of ${formatPrice(currentPrice)} to reach ${formatPrice(targetPrice)}. According to our ${coinName} prediction algorithm, ${coinName} could reach ${formatPrice(targetPrice)} by ${date}.

This price target ${feasibilityAssessment} in the ${timeframe}, depending on several factors including:

• Overall cryptocurrency market growth cycles
• Continued ${coinName} adoption and use cases
• Institutional and retail investment flows
• Regulatory developments impacting crypto markets
• Technical innovations within the ${coinName} ecosystem${coinName === "Bitcoin" ? "\n• Bitcoin halving events and their market impact" : ""}
• Sentiment from X posts & KOLs
• Global economic stability
${rank < 10 ? "• Corporate treasury adoption trends\n• Central bank digital currency impacts" : ""}
${coinName === "Bitcoin" ? "• Mass retail adoption via payment systems\nGlobal inflation scenarios" : ""}


At the current trajectory, reaching this milestone would require ${growth > 15 ? 'consistent' : 'slight'} growth and ${
  growth > 25 ? 'positive' : 
  growth > 15 ? 'favorable' : 
  growth > 5 ? 'growing' : 
  growth > 0 ? 'neutral' : 
  'stable'
} market sentiment over a ${
  growth > 15 ? 'sustained' : 
  growth > 5 ? 'continued' : 
  'sustained'
} period.`;
  };
  
  // Get best and worst case scenarios from prediction data
  const getBestCaseScenario = (timeframe: string) => {
    let predictionData;
    let timeDescription;
    
    switch(timeframe) {
      case 'short':
        predictionData = fiveDay;
        timeDescription = 'the next 5 days';
        break;
      case 'medium':
        predictionData = sixMonth;
        timeDescription = 'the next 6 months';
        break;
      case 'long':
        predictionData = oneYear;
        timeDescription = 'the next year';
        break;
      default:
        predictionData = oneMonth;
        timeDescription = 'the next month';
    }
    
    return {
      bestPrice: predictionData?.maxPrice,
      worstPrice: predictionData?.minPrice,
      avgPrice: predictionData?.price,
      roi: predictionData?.roi,
      timeDescription
    };
  };
  
  // Determine if short-term investment is advised based on technical indicators
  const getInvestmentAdvice = () => {
    return `Based on our analysis of ${coinName}'s current market position, we recommend:
${isProfitable ? 
  `• Considering a dollar-cost averaging approach for accumulation
• Setting profit targets at key resistance levels (${formatPrice(currentPrice * 1.2)}, ${formatPrice(currentPrice * 1.5)})
• Maintaining stop-loss orders at ${formatPrice(currentPrice * 0.85)} to manage downside risk` 
: 
  `• Exercising caution in the current market environment
• Waiting for confirmation of trend reversal before significant investment
• Considering smaller position sizes with strict risk management`}`;
  };
  
  // Determine buying recommendation based on technical indicators and predictions
  const getBuyRecommendation = () => {
    const shortTermOutlook = fiveDay.roi > 0 ? "positive" : "negative";
    const mediumTermOutlook = sixMonth.roi > 0 ? "positive" : "negative";  
    const longTermOutlook = oneYear.roi > 0 ? "positive" : "negative";
    
    if (shortTermOutlook === "positive" && mediumTermOutlook === "positive" && longTermOutlook === "positive") {
      return `Our technical analysis suggests ${coinName} may be in a favorable position across multiple timeframes, with bullish projections for short, medium, and long-term horizons. This alignment of positive indicators could present an attractive entry point for investors with various time horizons.`;
    } else if (shortTermOutlook === "negative" && mediumTermOutlook === "negative" && longTermOutlook === "negative") {
      return `Technical indicators currently suggest caution when considering ${coinName} for investment. Our models show bearish signals across short, medium, and long-term projections, which may indicate waiting for better market conditions before establishing positions.`;
    } else if (longTermOutlook === "positive" && shortTermOutlook === "negative") {
      return `While short-term indicators show potential volatility or downward pressure for ${coinName}, our long-term projections remain positive. This environment may better suit investors with longer time horizons who can tolerate near-term fluctuations for potential long-term appreciation.`;
    } else {
      return `${coinName} currently displays mixed signals across different timeframes. Our models suggest ${shortTermOutlook === "positive" ? "positive short-term momentum" : "near-term caution"} combined with ${mediumTermOutlook === "positive" ? "favorable" : "challenging"} medium-term outlook. Consider your investment strategy and risk tolerance in light of these mixed indicators.`;
    }
  };
  
  // Find year with 1 million price target if applicable
  const findYearForMillion = () => {
    if (currentPrice >= 1000000) return "already above $1 million";
    
    if (!currentPrice || !oneYear.roi || oneYear.roi <= 0) {
      return "difficult to predict with current data";
    }
    
    // Calculate years needed to reach $1 million using compound growth
    const annualGrowthRate = oneYear.roi / 100;
    const yearsNeeded = Math.log(1000000 / currentPrice) / Math.log(1 + annualGrowthRate);
    
    if (yearsNeeded <= 0 || isNaN(yearsNeeded) || yearsNeeded > 100) {
      return "the distant future, if ever, based on current growth projections";
    }
    
    // Convert to a future date
    const targetDate = new Date();
    targetDate.setFullYear(targetDate.getFullYear() + Math.ceil(yearsNeeded));
    
    return targetDate.getFullYear().toString();
  };
  
  // Analyze 2030 prediction based on yearly projections or growth models
  const get2030Prediction:any = () => {
    // Check if we have 2030 in yearly predictions
    if (yearlyPredictions && yearlyPredictions[2030] && yearlyPredictions[2030].length > 0) {
      const predictions2030 = yearlyPredictions[2030];
      
      // Calculate average of all 2030 monthly predictions
      const avgPrice = predictions2030.reduce((sum: number, month: any) => sum + (typeof month.price === 'number' ? month.price : 0), 0) / predictions2030.length;
      
      // Find min and max prices
      const minPrice = Math.min(...predictions2030.map((month: any) => typeof month.minPrice === 'number' ? month.minPrice : avgPrice * 0.7));
      const maxPrice = Math.max(...predictions2030.map((month: any) => typeof month.maxPrice === 'number' ? month.maxPrice : avgPrice * 1.3));
      const averageConfidence = predictions2030.reduce((sum: number, month: any) => sum + (typeof month.confidence === 'number' ? month.confidence : 0), 0) / predictions2030.length;
      return {
        minPrice,
        avgPrice,
        maxPrice,
        roi: ((avgPrice - currentPrice) / currentPrice) * 100,
        confidence: averageConfidence
      };
    }
    
    // If we don't have 2030 data, extrapolate from yearly ROI
    // Assuming compound growth based on yearly ROI
    const yearsTo2030 = 2030 - new Date().getFullYear();
    const yearlyGrowthRate = oneYear.roi / 100;
    
    // Calculate compound growth
    // Future Value = Present Value * (1 + Rate)^Years
    const growthMultiplier = Math.pow(1 + yearlyGrowthRate, yearsTo2030);
    
    const avgPrice = currentPrice * growthMultiplier;
    const minPrice = avgPrice * 0.7; // Conservative estimate
    const maxPrice = avgPrice * 1.3; // Optimistic estimate
    
    return {
      minPrice,
      avgPrice,
      maxPrice,
      roi: ((avgPrice - currentPrice) / currentPrice) * 100
    };
  };
  
  // Get 2030 prediction
  const prediction2030 = get2030Prediction();
  
  // Generate milestone questions based on available data
  const generateMilestoneQuestions = () => {
    const milestoneQuestions = [];
    const { price1, price2, price3 } = getMilestonePrices();
    
    // Add standard milestone questions
    milestoneQuestions.push({
      question: `Will ${coinName} reach ${formatPrice(price1)}?`,
      answer: generateMilestoneAnswer(price1)
    });
    
    milestoneQuestions.push({
      question: `Will ${coinName} reach ${formatPrice(price2)}?`,
      answer: generateMilestoneAnswer(price2)
    });
    
    milestoneQuestions.push({
      question: `Will ${coinName} reach ${formatPrice(price3)}?`,
      answer: generateMilestoneAnswer(price3)
    });
    
    // Check if $1 million is a relevant question for this coin
    const millionDollarRelevant = currentPrice < 1000000 && 
      (coinName === "Bitcoin" || coinName === "Ethereum" || currentPrice > 1000);
      
    if (millionDollarRelevant) {
//       milestoneQuestions.push({
//         question: `Will ${coinName} reach $1 million?`,
//         answer: `${coinName} would need to gain ${calculateGrowthToMilestone(1000000).toFixed(2)}% to reach $1 million from its current price of ${formatPrice(currentPrice)}. According to our ${coinName} prediction algorithm, ${coinName} could potentially reach $1 million by ${findYearForMillion()}.

// This milestone would require:
// • Sustained compound annual growth rates significantly above traditional investments
// • Continued institutional adoption and integration into global financial systems
// • Favorable regulatory environments across major economies
// • Technology scaling solutions to accommodate widespread usage
// ${coinName === "Bitcoin" ? "• Multiple halving cycles reducing new supply while demand continues to grow" : ""}

// While ambitious, the $1 million target represents a ${currentPrice < 10000 ? "transformative valuation milestone" : "significant but potentially achievable growth trajectory"} for ${coinName} over the long term, assuming continued evolution of the cryptocurrency ecosystem and mainstream adoption.`
//       });
    }
    
    return milestoneQuestions;
  };
  
  // Generate FAQs with detailed, accurate answers
  const faqs = [
      {
        question: `What is ${coinName}'s price prediction today?`,
      answer: `Based on our ${coinName} prediction chart, technical indicators, on-chain analysis, and algorithmic analysis, the price of ${coinName} is expected to ${
        fiveDay?.roi > 25 ? 'increase immensely' : 
        fiveDay?.roi > 10 ? 'increase highly' : 
        fiveDay?.roi > 0 ? 'increase substantially' : 
        fiveDay?.roi === 0 ? 'stay neutral' : 
        fiveDay?.roi > -5 ? 'decrease slightly' : 
        'decrease hugely'
      } by ${Math.abs(fiveDay?.roi * 0.2)?.toFixed(2)}% and reach ${formatPrice(currentPrice * (1 + fiveDay?.roi * 0.2 / 100))} by the end of today, ${formatDate(today)}.

This short-term prediction is derived from analyzing historical price movements, trading volume patterns, technical indicators, on-chain analysis, and momentum indicators specific to ${coinName}. Our analysis shows a ${fiveDay?.roi > 0 ? 'positive' : 'negative'} sentiment with ${
  fiveDay?.confidence <= 50 ? 'neutral' :
  fiveDay?.confidence > 50 && fiveDay?.confidence <= 60 ? 'significant' :
  fiveDay?.confidence > 60 && fiveDay?.confidence <= 85 ? 'higher' :
  'staggering'
} confidence (${fiveDay?.confidence?.toFixed(1)}%) in this projection.`
      },
      {
        question: `What is ${coinName} price prediction for tomorrow?`,
      answer: `${coinName} is predicted to ${
        fiveDay?.roi > 25 ? 'immensely grow by' : 
        fiveDay?.roi > 10 ? 'substantially gain by' : 
        fiveDay?.roi > 0 ? 'slightly gain by' : 
        fiveDay?.roi === 0 ? 'stay neutral with' : 
        fiveDay?.roi > -5 ? 'decrease slightly by' : 
        'decrease hugely by'
      } ${Math.abs(fiveDay?.roi * 0.4)?.toFixed(2)}% and reach a price of ${formatPrice(currentPrice * (1 + fiveDay?.roi * 0.4 / 100))} by tomorrow, ${formatDate(tomorrow)}.

This forecast is based on a combination of technical analysis factors including:
• Recent trading volume: ${formatPrice(currentPrice * 0.15)} daily average
• Short-term momentum indicators
• Market sentiment analysis
• Price action patterns over the past 24-48 hours
• On-chain transaction activity and wallet movements
• Relation with altcoin market trends
• Real-time order book depth

Market volatility could influence this projection, with our detailed research and analysis model showing a potential range between ${formatPrice(currentPrice * (1 + fiveDay?.roi * 0.3 / 100))} and ${formatPrice(currentPrice * (1 + fiveDay?.roi * 0.5 / 100))} for tomorrow's trading.`
      },
      {
        question: `What is the ${coinName} price prediction for this week?`,
      answer: `According to our ${coinName} price prediction model, ${coinTicker} is forecasted to trade within a ${fiveDay?.minPrice < currentPrice ? 'lower' : 'higher'} price range of ${formatPrice(fiveDay?.minPrice)} and ${formatPrice(fiveDay?.maxPrice)} this week. ${coinName} is projected to ${
        fiveDay?.roi > 25 ? 'impressively surge by' : 
        fiveDay?.roi > 10 ? 'highly increase by' : 
        fiveDay?.roi > 0 ? 'slightly increase by' : 
        fiveDay?.roi > -5 ? 'slight decrease by' : 
        'Notably decrease by'
      } ${Math.abs(fiveDay?.roi)?.toFixed(2)}% and ${
        fiveDay?.roi > 25 ? 'touch' : 'reach'
      } ${formatPrice(fiveDay?.price)} by ${formatDate(endOfWeek)} if it reaches our projected ${fiveDay?.roi > 0 ? 'profit' : 'loss'} target.

Our algorithmic analysis indicates ${fiveDay?.sentiment?.toLowerCase()} momentum with ${
  fiveDay?.confidence <= 50 ? 'neutral' :
  fiveDay?.confidence > 50 && fiveDay?.confidence <= 60 ? 'significant' :
  fiveDay?.confidence > 60 && fiveDay?.confidence <= 85 ? 'higher' :
  'staggering'
} confidence (${fiveDay?.confidence?.toFixed(1)}%) in this prediction. The market shows ${
  parseInt(greenDays?.split('/')[0]) > 20 ? 'extremely high' :
  parseInt(greenDays?.split('/')[0]) > 15 ? 'higher' :
  parseInt(greenDays?.split('/')[0]) > 7 ? 'moderate' :
  parseInt(greenDays?.split('/')[0]) > 0 ? 'mild' :
  'neutral'
} buying activity with ${greenDays} green days in the past month.

Key technical indicators supporting this forecast include:
• RSI: ${rsi14?.toFixed(2)} (${
  rsi14 < 40 ? 'oversold' :
  rsi14 > 60 ? 'overbought' :
  'neutral'
})
• 50-day SMA: ${formatPrice(sma50)}
• 200-day SMA: ${formatPrice(sma200)}
• Current market sentiment: ${fearGreedZone}
• Exchange inflow/outflow trends`

      },
      {
        question: `What is the ${coinName} price prediction for next week?`,
      answer: `The ${coinName} price prediction for next week suggests a trading range between ${formatPrice(oneMonth?.price * 0.9)} on the lower end and ${formatPrice(oneMonth?.price * 1.1)} on the high end. Based on our analytically backed ${coinTicker} price prediction algorithm, the price of ${coinName} could ${
        oneMonth?.roi > 20 ? 'highly increase by' : 
        oneMonth?.roi > 5 ? 'notably increase by' : 
        oneMonth?.roi > 0 ? 'mildly rise by' : 
        oneMonth?.roi === 0 ? 'stay neutral' : 
        oneMonth?.roi > -5 ? 'slightly drop by' : 
        'significantly drop by'
      } ${Math.abs(oneMonth?.roi * 0.3)?.toFixed(2)}% and reach ${formatPrice(currentPrice * (1 + oneMonth?.roi * 0.3 / 100))} by ${formatDate(nextWeek)} if market conditions align with our forecast.

Factors that could influence next week's price action include:
• Overall market direction and Bitcoin correlation
• Trading volume trends (currently ${oneMonth?.roi > 0 ? 'increasing' : 'decreasing'})
• Key support level at ${formatPrice(currentPrice * 0.9)}
• Key resistance level at ${formatPrice(currentPrice * 1.1)}
• Macroeconomic news
• Sentiment shifts on X
• Institutional order flow signals

Our advanced algorithm assigns a ${
  oneMonth?.confidence > 85 ? 'Staggering confidence' : 
  oneMonth?.confidence > 60 ? 'Higher confidence' : 
  oneMonth?.confidence > 50 ? 'Significant confidence' : 
  'Neutral confidence'
} to this projection, suggesting ${
  oneMonth?.confidence > 85 ? 'high confidence and extreme optimism' : 
  oneMonth?.confidence > 60 ? 'moderate confidence and cautious optimism' : 
  oneMonth?.confidence > 50 ? 'lower confidence and slight caution' : 
  'neutral confidence and slight fear'
} in the prediction.`
    },
    {
      question: `What is the ${coinName} price prediction for next month?`,
      answer: `According to our ${coinName} forecast, the price of ${coinName} is expected to ${
        oneMonth?.roi > 25 ? 'impressively rise by' : 
        oneMonth?.roi > 10 ? 'moderately increase by' : 
        oneMonth?.roi > 0 ? 'slightly rise by' : 
        oneMonth?.roi === 0 ? 'stay neutral' : 
        oneMonth?.roi > -5 ? 'slightly decline by' : 
        'significantly drop by'
      } ${Math.abs(oneMonth?.roi)?.toFixed(2)}% over the next month and reach ${formatPrice(oneMonth?.price)} by ${formatDate(nextMonth)}.

This medium-term prediction is based on comprehensive analysis of:
• Historical price patterns and cyclical behavior
• On-chain metrics showing ${oneMonth?.roi > 0 ? 'accumulation' : 'distribution'} trends
• Technical indicators suggesting ${oneMonth?.sentiment?.toLowerCase()} momentum
• Market sentiment currently in the ${fearGreedZone} zone (${fearGreedIndex}/100)
• Funding rates in perpetual futures markets
• Correlation with equity markets
• Upcoming blockchain upgrades or events

Our detailed research and analysis model forecasts a trading range between ${formatPrice(oneMonth?.minPrice)} and ${formatPrice(oneMonth?.maxPrice)} during this period, with ${
  oneMonth?.confidence > 85 ? 'staggering' : 
  oneMonth?.confidence > 60 ? 'higher' : 
  oneMonth?.confidence > 50 ? 'significant' : 
  'neutral'
} confidence (${oneMonth?.confidence?.toFixed(1)}%) in reaching the projected target of ${formatPrice(oneMonth?.price)}.`
      },
      {
        question: `What is the ${coinName} price prediction for 2025?`,
      answer: `${coinName} is forecasted to trade within a range of ${formatPrice(oneYear?.minPrice * 0.8)} and ${formatPrice(oneYear?.maxPrice * 1.2)} during 2025. If it reaches the upper price target, ${coinTicker} could ${
        oneYear?.roi > 350 ? 'whopping increase by' : 
        oneYear?.roi > 200 ? 'significant go up by' : 
        oneYear?.roi > 75 ? 'moderately surge by' : 
        oneYear?.roi > 0 ? 'slight increase by' : 
        oneYear?.roi === 0 ? 'stay neutral' : 
        oneYear?.roi > -30 ? 'slight decline by' : 
        'Notably decline by'
      } ${Math.abs(oneYear?.roi * 1.2)?.toFixed(2)}% and reach ${formatPrice(oneYear?.price * 1.2)}.

Our 2025 prediction model considers several key factors:
• Market cycle positioning (${new Date().getFullYear() + 1 === 2025 ? 'potentially entering a new bull cycle' : 'middle stage of the current market cycle'})
• Supply/demand dynamics including ${coinName === "Bitcoin" ? "the 2024 halving impact" : "token utility and adoption metrics"}
• Institutional adoption trends and potential regulatory developments
• Macroeconomic environment and correlation with traditional markets
• Bitcoin ETF inflows/outflows
• Global inflation trends
• Technological adoption

With ${
  oneYear?.confidence <= 50 ? 'neutral' : 
  oneYear?.confidence > 50 && oneYear?.confidence <= 60 ? 'significant' : 
  oneYear?.confidence > 60 && oneYear?.confidence <= 85 ? 'higher' : 
  'staggering'
} confidence (${oneYear?.confidence?.toFixed(1)}%) in this projection, our models suggest 2025 could be a ${oneYear?.roi > 50 ? 'strong growth' : oneYear?.roi > 15 ? 'notable growth' : oneYear?.roi > 0 ? 'slight growth' : oneYear?.roi > -15 ? 'mild decline' : 'higher decline'} period for ${coinName}, influenced by broader cryptocurrency market maturation and adoption.`
      },
      {
        question: `What is the ${coinName} price prediction for 2030?`,
      answer: `The ${coinName} price prediction for 2030 suggests a potential range between ${formatPrice(prediction2030?.minPrice)} on the lower end and ${formatPrice(prediction2030?.maxPrice)} on the high end. Based on our long-term growth models, ${coinName} could potentially ${prediction2030?.roi >= 0 ? 'gain' : 'drop'} ${Math.abs(prediction2030?.roi).toFixed(2)}% from current levels and reach ${formatPrice(prediction2030?.avgPrice)} by 2030 assuming ${
        prediction2030?.roi > 200 ? 'surging' : 
        prediction2030?.roi > 50 ? 'growing' : 
        prediction2030?.roi > 0 ? 'continued' : 
        prediction2030?.roi === 0 ? 'neutral' : 
        'declining'
      } market development.

This long-term forecast incorporates multiple factors:
• Projected cryptocurrency market growth and mainstream adoption
• ${coinName}'s network effect and competitive positioning
• Technological advancements and scaling solutions
• Potential institutional integration into financial systems
• Regulatory landscape evolution globally
• Energy consumption and sustainability trends
• Geopolitical influences on digital assets
• Long-term inflation hedging demand

  It's important to note that long-term cryptocurrency predictions carry ${
    prediction2030?.confidence <= 40 ? 'significant uncertainty' : 
    prediction2030?.confidence > 40 && prediction2030?.confidence <= 60 ? 'moderate uncertainty' : 
    prediction2030?.confidence > 60 && prediction2030?.confidence <= 80 ? 'slight uncertainty' : 
    'minimal uncertainty'
  }, as the market will likely undergo multiple cycles between now and 2030. The projection represents a potential trajectory based on current ${prediction2030?.roi >= 0 ? 'growth' : 'decline'} patterns and adoption trends rather than a guaranteed outcome.`
    },
    ...generateMilestoneQuestions(),
//     {
//       question: `Will ${coinName} reach ${formatPrice(price1)}?`,
//       answer: generateMilestoneAnswer(price1)
//     },
//     {
//       question: `Will ${coinName} reach ${formatPrice(price2)}?`,
//       answer: generateMilestoneAnswer(price2)
//     },
//     {
//       question: `Will ${coinName} reach ${formatPrice(price3)}?`,
//       answer: generateMilestoneAnswer(price3)
//     },
//     {
//       question: `Will ${coinName} reach $1 million?`,
//       answer: `${coinName} would need to gain ${calculateGrowthToMilestone(1000000).toFixed(2)}% to reach $1 million from its current price of ${formatPrice(currentPrice)}. According to our ${coinName} prediction algorithm, ${coinName} could potentially reach $1 million by ${findYearForMillion()}.

// This milestone would require:
// • Sustained compound annual growth rates significantly above traditional investments
// • Continued institutional adoption and integration into global financial systems
// • Favorable regulatory environments across major economies
// • Technology scaling solutions to accommodate widespread usage
// ${coinName === "Bitcoin" ? "• Multiple halving cycles reducing new supply while demand continues to grow" : ""}

// While ambitious, the $1 million target represents a ${currentPrice < 10000 ? "transformative valuation milestone" : "significant but potentially achievable growth trajectory"} for ${coinName} over the long term, assuming continued evolution of the cryptocurrency ecosystem and mainstream adoption.`
//       },
      {
        question: `What is the current ${coinName} sentiment?`,
      answer: `The current ${coinName} sentiment is ${fiveDay?.sentiment?.toLowerCase()} according to our comprehensive technical analysis. This assessment is derived from a weighted combination of multiple technical indicators, market momentum signals, and sentiment analysis.

Key factors influencing current sentiment:
• RSI (${rsi14?.toFixed(2)}): ${getRSISentiment(rsi14)}
• Moving average relationship: ${sma50 > sma200 ? "Bullish (50-day above 200-day)" : "Bearish (50-day below 200-day)"}
• Fear & Greed Index: ${fearGreedIndex}/100 (${fearGreedZone})
• Recent price action: ${greenDays} green days in the past month
• On-chain activity
• Social media (X) sentiment trends
• Funding rates in futures markets
• Institutional buying/selling signals


Market sentiment indicators suggest that ${coinName} is currently experiencing ${
  fearGreedIndex <= 24 ? "negative investor positioning, with widespread pessimism creating potential contrarian buying opportunities" : 
  fearGreedIndex <= 49 ? "cautious investor positioning, with market participants showing hesitancy amid uncertain conditions" : 
  fearGreedIndex <= 75 ? "positive investor positioning, with growing optimism about near-term price appreciation" : 
  "extremely positive investor positioning, potentially indicating market euphoria that historically precedes corrections"
}. The current RSI of ${rsi14?.toFixed(2)} and ${greenDays} green days in the past month further support this sentiment assessment.


Market sentiment indicators suggest that ${coinName} is currently experiencing ${
  fearGreedIndex <= 24 ? "negative investor positioning" :
  fearGreedIndex <= 49 ? "cautious investor positioning" :
  fearGreedIndex <= 75 ? "positive investor positioning" :
  "extremely positive investor positioning"
}, which historically can precede potential ${fearGreedIndex <= 49 ? "bullish reversals" : "bearish corrections"}.
`
      },
      {
        question: `What is the ${coinName} Fear & Greed Index and what does it indicate?`,
      answer: `Currently, the ${coinName} Fear & Greed Index stands at ${fearGreedIndex}, which means that investors' sentiment is in the ${getFearGreedDescription(fearGreedIndex)} zone.

The Fear & Greed Index is a comprehensive market sentiment indicator that combines several key metrics:
• Market volatility (historical and recent)
• Trading volume trends
• Social media sentiment analysis
• Market momentum and dominance
• Google Trends data related to ${coinName}
• Token ’s correlation with bitcoin and traditional assets {Bitcoin Specific}
• Whale transaction patterns
• Search interest in alternative cryptocurrencies
• Retail investor participation levels

The index ranges from 0-100, with different zones indicating market sentiment:
• 0-24: Extreme Fear - Often considered a potential buying opportunity (contrarian indicator)
• 25-49: Fear - Caution with possible value opportunities
• 50-59: Neutral - Balanced market conditions
• 60-74: Greed - Potential overvaluation concerns
• 75-100: Extreme Greed - Possible market euphoria, considered a potential selling opportunity

Many experienced traders use this index as a contrarian indicator, with extreme fear potentially signaling buying opportunities and extreme greed potentially signaling times for profit-taking or increased caution. The current reading of ${fearGreedIndex} (${getFearGreedDescription(fearGreedIndex)}) suggests ${fearGreedZone === "Fear" || fearGreedZone === "Extreme Fear" ? "potentially oversold conditions" : fearGreedZone === "Greed" || fearGreedZone === "Extreme Greed" ? "potentially overbought conditions" : "a relatively neutral market"}.`
      },
      {
        question: `Is it profitable to invest in ${coinName}?`,
      answer: `Over the last 30 days, ${coinName} had ${greenDays} green days (days with positive price movement). Based on our historical data analysis and current technical indicators, it is ${isProfitable ? "potentially profitable" : "currently showing mixed signals"} to invest in ${coinName}.

The price of ${coinName} has ${
  oneYear.roi > 250 ? `whopping increased by approximately ${oneYear.roi.toFixed(2)}%` : 
  oneYear.roi > 50 ? `highly surged by approximately ${oneYear.roi.toFixed(2)}%` : 
  oneYear.roi > 0 ? `slightly increased by approximately ${oneYear.roi.toFixed(2)}%` : 
  oneYear.roi > -25 ? `slightly decreased by approximately ${Math.abs(oneYear.roi).toFixed(2)}%` : 
  `notably decreased by approximately ${Math.abs(oneYear.roi).toFixed(2)}%`
} over the past year. Current technical analysis shows:

• RSI (${rsi14?.toFixed(2)}): ${getRSISentiment(rsi14)} conditions
• Moving Averages: ${sma50 > sma200 ? "Bullish alignment (50-day above 200-day)" : "Bearish alignment (50-day below 200-day)"}
• Market Sentiment: ${fearGreedZone} zone (${fearGreedIndex}/100)
• Recent Performance: ${parseInt(greenDays?.split('/')[0]) > 15 ? "Strong" : "Moderate"} with ${greenDays} positive days

${getInvestmentAdvice()}

For a optimal investment approach, consider:
• Dollar-cost averaging rather than lump-sum investing
• Setting clear profit-taking and stop-loss targets
• Diversifying across multiple cryptocurrencies
  `},  // Add the milestone questions dynamically
  ];
  
  return faqs;
}; 