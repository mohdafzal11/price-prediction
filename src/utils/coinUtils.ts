/**
 * Generates a standardized about text for a cryptocurrency
 * @param coin The coin data object
 * @param shortVersion If true, returns a shorter version for SEO descriptions
 * @returns Formatted about text
 */
export const generateCoinAboutText = (coin: any, shortVersion = false): string => {
  let aboutText = `${coin.name} (${coin.ticker ? coin.ticker.toUpperCase() : ''}) represents a significant player in the digital asset ecosystem.`;
  
  // Add supply information
  if (coin.marketData?.totalSupply || coin.marketData?.circulatingSupply) {
    aboutText += ` With a ${coin.marketData.totalSupply ? `robust current supply of ${Number(coin.marketData.totalSupply).toLocaleString()} ${coin.ticker ? coin.ticker.toUpperCase() : ''}` : ''}${coin.marketData.totalSupply && coin.marketData.circulatingSupply ? ' and ' : ''}${coin.marketData.circulatingSupply ? `${Number(coin.marketData.circulatingSupply).toLocaleString()} actively circulating in the market` : ''}, ${coin.name} demonstrates considerable market presence.`;
  }
  
  // Add price information
  if (coin.currentPrice?.usd !== undefined) {
    aboutText += ` The current market valuation places ${coin.name} at $${typeof coin.currentPrice.usd === 'number' ? coin.currentPrice.usd.toFixed(2) : coin.currentPrice.usd} per token`;
    
    if (coin.priceChanges?.day1 !== undefined) {
      aboutText += `, reflecting a ${Math.abs(coin.priceChanges.day1).toFixed(2)}% ${coin.priceChanges.day1 >= 0 ? 'increase' : 'decrease'} in value during the past 24-hour trading period. This price movement indicates ${coin.priceChanges.day1 >= 2 ? 'strong' : coin.priceChanges.day1 >= 0 ? 'moderate' : 'volatile'} market activity within the ${coin.ticker ? coin.ticker.toUpperCase() : ''} ecosystem.`;
    } else {
      aboutText += '.';
    }
  }
  
  // For short version (SEO), return here
  if (shortVersion) {
    return aboutText;
  }
  
  // Add volume information for full version
  if (coin.marketData?.volume24h) {
    aboutText += ` Investor engagement with ${coin.name} remains substantial, with $${Number(coin.marketData.volume24h).toLocaleString()} in trading volume recorded across various diverse and active trading platforms over the last 24 hours. This level of liquidity highlights the ongoing interest and utility of ${coin.ticker ? coin.ticker.toUpperCase() : ''} within the broader cryptocurrency landscape.`;
  }
  
  // Add website information for full version
  if (coin.socials?.website && coin.socials.website[0]) {
    aboutText += ` For comprehensive details regarding ${coin.name}'s development roadmap, technical specifications, and community initiatives, interested parties are encouraged to visit the project's official resource hub at ${coin.socials.website[0]}.`;
  }
  
  // Fallback if no information is available
  if (!coin.description && !coin.marketData?.totalSupply && !coin.marketData?.circulatingSupply && coin.currentPrice?.usd === undefined && !coin.marketData?.volume24h) {
    aboutText = `Information about ${coin.name} is currently limited. Please check back later for more details as they become available.`;
  }
  
  return aboutText;
}; 