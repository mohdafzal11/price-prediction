export const generateTokenUrl = (name: string, ticker: string) => {
  // Only replace spaces with hyphens, preserve other special characters
  const processedName = name.toLowerCase().replace(/\s+/g, '-');
  const processedTicker = ticker.toLowerCase().replace(/\s+/g, '-');
  
  // Use double hyphen only if ticker contains spaces
  const separator = ticker.includes(' ') ? '--' : '-';
  
  return `${processedName}${separator}${processedTicker}`;
};

export const generateExchangeUrl = (slug: string) => {
  return `${process.env.NEXT_PUBLIC_EXCHANGE_PAGE_URL}/${slug}`;
};

export const generateConverterUrl = (slug1: string, slug2: string) => {
  return `${process.env.NEXT_PUBLIC_CONVERTER_PAGE_URL}/${slug1}/${slug2}`;
};

export const parseTokenSlug = (slug: string) => {
  try {
    // Remove /prediction suffix if present (for prediction URLs)
    if (slug.endsWith('/prediction')) {
      slug = slug.replace('/prediction', '');
    }
    
    // Check if slug contains double hyphen
    if (slug.includes('--')) {
      const [namePart, tickerPart] = slug.split('--');
      return {
        // Sanitize name and ticker to prevent regex issues
        name: sanitizeSlugPart(namePart),
        ticker: sanitizeSlugPart(tickerPart).toUpperCase()
      };
    }
    
    // Otherwise, split by last single hyphen
    const lastHyphenIndex = slug.lastIndexOf('-');
    if (lastHyphenIndex === -1) {
      return null;
    }
    
    return {
      name: sanitizeSlugPart(slug.slice(0, lastHyphenIndex)),
      ticker: sanitizeSlugPart(slug.slice(lastHyphenIndex + 1)).toUpperCase()
    };
  } catch (error) {
    console.error('Error parsing token slug:', slug, error);
    return null;
  }
};

// Helper function to sanitize slug parts and prevent regex issues
function sanitizeSlugPart(part: string): string {
  try {
    // First decode URI component if needed
    const decoded = decodeURIComponent(part);
    
    // Replace hyphens with spaces
    const withSpaces = decoded.replace(/-/g, ' ');
    
    // Remove or escape special regex characters that could cause issues
    // This includes: ( ) [ ] { } . * + ? ^ $ \ | 
    return withSpaces.replace(/[\(\)\[\]\{\}\.\*\+\?\^\$\\\|]/g, '');
  } catch (e) {
    // If decoding fails, just replace hyphens and sanitize
    return part.replace(/-/g, ' ').replace(/[\(\)\[\]\{\}\.\*\+\?\^\$\\\|]/g, '');
  }
};


// For ES module compatibility: run test code only if this file is executed directly
if (import.meta.url === process.argv[1] || import.meta.url === `file://${process.argv[1]}`) {
  console.log(generateTokenUrl('FARTCOIN (fartcoin.one)', 'fartcoin'));
}