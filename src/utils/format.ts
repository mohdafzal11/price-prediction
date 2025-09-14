/**
 * Format a cryptocurrency price with appropriate decimal places based on its value
 * - For values >= 1: Show 2 decimal places
 * - For values < 1: Show significant digits to capture the first non-zero decimal place
 * 
 * @param price The price to format
 * @returns Formatted price string without currency symbol
 */
export const formatCryptoPrice = (price: number | string | undefined): string => {
  if (price === undefined || price === null) {
    return '0';
  }
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return '0';
  }
  
  // For values >= 1, show 2 decimal places
  if (numPrice >= 1) {
    return numPrice.toFixed(2);
  }
  
  // For very small values, find the first non-zero decimal place
  const priceStr = numPrice.toString();
  const decimalIndex = priceStr.indexOf('.');
  
  if (decimalIndex === -1) {
    return numPrice.toFixed(2);
  }
  
  // Find position of first non-zero digit after decimal
  let firstNonZeroPos = -1;
  for (let i = decimalIndex + 1; i < priceStr.length; i++) {
    if (priceStr[i] !== '0') {
      firstNonZeroPos = i;
      break;
    }
  }
  
  if (firstNonZeroPos === -1) {
    return '0';
  }
  
  // Show up to the first non-zero digit plus one more digit for precision
  const significantDigits = firstNonZeroPos - decimalIndex + 1;
  return numPrice.toFixed(Math.min(significantDigits + 1, 8)); // Cap at 8 decimal places max
};

/**
 * Format a large number (like volume or market cap) to be more readable
 * 
 * @param value The value to format
 * @returns Formatted value with appropriate decimal places
 */
export const formatLargeNumber = (value: number | string | undefined): string => {
  if (value === undefined || value === null) {
    return '0';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '0';
  }
  
  // For billions
  if (numValue >= 1_000_000_000) {
    return (numValue / 1_000_000_000).toFixed(2) + 'B';
  }
  
  // For millions
  if (numValue >= 1_000_000) {
    return (numValue / 1_000_000).toFixed(2) + 'M';
  }
  
  // For thousands
  if (numValue >= 1_000) {
    return (numValue / 1_000).toFixed(2) + 'K';
  }
  
  // For regular numbers
  return numValue.toFixed(2);
};
