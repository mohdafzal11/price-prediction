export interface Token {
  id: string;
  ticker: string;
  name: string;
  slug: string;
  rank: number;
  price: number;
  priceChange: {
    '1h': number | null;
    '24h': number | null;
    '7d': number | null;
  };
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  lastUpdated: string;
  cmcId: number;
  lastSevenData?: {
    price: number;
    timestamp: string;
  }[];
  prediction?: any;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
}

export interface Info {
  topGainers: Token[];
  topLosers: Token[];
  marketcap: { value: number; change: number };
  volume: { value: number; change: number };
  dominance: {
    btc: number;
    eth: number;
  };
  fear_and_greed: {
    value: number;
    classification: string;
  };
}


export interface Exchange {
  exchange: string;
  pair: string;
  volume24h: number;
  logoUrl?: string;
  slug?: string;
}

export interface TokenDescription {
  id: string;
  ticker: string;
  name: string;
  slug: string;
  rank?: number;
  currentPrice: {
    usd: number;
    lastUpdated: Date;
  };
  marketData: {
    marketCap?: number;
    fdv?: number;
    volume24h?: number;
    volumeChange24h?: number;
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
    reddit: string[];
    facebook: string[];
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
  tradingMarkets?: Exchange[];
}

export interface ChartDataPoint {
  timestamp: string | number;
  price: number;
  volume: number;
  percent_change_24h?: number;
}