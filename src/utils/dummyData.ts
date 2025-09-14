export const generateDummyPriceData = (
  days: number,
  basePrice: number,
  volatility: number
): [number, number][] => {
  const data: [number, number][] = [];
  const now = new Date();
  
  // Generate a somewhat realistic trend
  const trendDirection = Math.random() > 0.5 ? 1 : -1;
  const trendStrength = Math.random() * 0.2; // 0-20% overall trend

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add daily randomness
    const dailyChange = (Math.random() - 0.5) * 2 * volatility;
    
    // Add trend component
    const trendComponent = (trendDirection * trendStrength * (days - i)) / days;
    
    // Calculate price with both random movement and trend
    const priceChange = basePrice * (dailyChange + trendComponent);
    const price = basePrice + priceChange;
    
    data.push([date.getTime(), price]);
  }

  return data;
};
