export const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined) return '0.00';
  
  if (price >= 1) {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } else if (price === 0) {
    return '0.00';
  } else {
    const priceStr = price.toString();
    const [, decimal = ''] = priceStr.split('.');
    const firstNonZeroIndex = decimal.search(/[1-9]/);
    
    if (firstNonZeroIndex === -1) {
      return '0.00';
    }

    // For very small numbers (e.g., 0.0000001391)
    if (firstNonZeroIndex > 4) {
      const zeros = firstNonZeroIndex;
      const significantDigits = decimal.slice(firstNonZeroIndex, firstNonZeroIndex + 4);
      return `$0.0<span style="font-size: 0.85em">${zeros}</span>${significantDigits}`;
    }
    
    // For regular small numbers, show more precision
    return price.toFixed(Math.max(firstNonZeroIndex + 4, 2));
  }
};

export const formatLargeValue = (price: number | null | undefined): string => {
  if (price === null || price === undefined) return '0';
  return Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
    Number(price)
  );
};

export const formatNumberToHumanNotation = (num: number | null | undefined, decimals: number = 2): string => {
  // 1000 = 1K, 1000000 = 1M, 1000000000 = 1B, 1000000000000 = 1T
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

export const formatPercentageValue = (
  price: number | null | undefined,
  digits: number = 2
): string => {
  if (price === null || price === undefined) return '0.00';
  return Number(price).toFixed(digits);
};

export const displayValueIfExists = (
  callback: (value: number) => string,
  value: number | null | undefined
): string => {
  if (value === null || value === undefined) return '-';
  return callback(value);
};

