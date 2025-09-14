import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Header,
    Title,
    GridContainer,
    CoinCard,
    ChartContainer,
    CoinInfo,
    CoinName,
    CoinLogo,
    PriceContainer,
    Price,
    PriceChange,
} from './SimilarCrypto.styled';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { getApiUrl, getCmcImageUrl } from "utils/config";
import { useTheme } from 'styled-components';
import Image from 'next/image';
import CryptoChipCard from 'components/CryptoChipCard/CryptoChipCard';
import Link from 'next/link';
import { generateTokenUrl } from 'utils/url';
import CustomLink from 'components/CustomLink/CustomLink';


const SimilarCrypto = ({ coin }: { coin: any }) => {
    const [activeTimeFilter, setActiveTimeFilter] = useState('24h');
    const [similarCoins, setSimilarCoins] = useState<any[]>([]);
    const [ecosystemCoins, setEcosystemCoins] = useState<{[key: string]: any[]}>({});
    const [loading, setLoading] = useState(true);
    const [expandedEcosystems, setExpandedEcosystems] = useState<{[key: string]: boolean}>({});
    const theme = useTheme();

    // Move fetchSimilarCoins into a useCallback to stabilize it
    const fetchSimilarCoins = useCallback(async () => {
        if (!coin?.cmcId) return;
        
        try {
            setLoading(true);
            const response = await axios.get(getApiUrl(`/coin/similar/${coin.cmcId}`));
            
            if (response.data) {
                let formattedCoins: any[] = [];
                let ecosystems: {[key: string]: any[]} = {};
                
                // Handle array response (old format)
                if (Array.isArray(response.data)) {
                    formattedCoins = response.data.map((item: any, index: number) => {
                        const priceChange = getTimeFilteredPriceChange(item.token.priceChange);
                        const isPositive = priceChange >= 0;
                        
                        // Prepare chart data
                        let chartData: any[] = [];
                        if (item.chartData && Array.isArray(item.chartData)) {
                            // Use the chart data from the API
                            chartData = item.chartData
                        } else {
                            // Fallback to empty chart
                            chartData = [];
                        }
                        
                        // Calculate shared category percentage
                        const sharedPercentage = Math.round((item.sharedCategoryCount / item.totalCategoryCount) * 100);
                        const matchLabel = index === 0 ? "Best Match" : 
                                          index === 1 ? "2nd Best Match" : 
                                          index === 2 ? "3rd Best Match" : 
                                          `${sharedPercentage}% Match`;
                        
                        // Format meta info
                        const sharedCategoryNames = item.sharedCategories
                            .filter((cat: any) => cat.name)
                            .map((cat: any) => cat.name)
                            .slice(0, 2)
                            .join(', ');
                        
                        const metaInfo = {
                            type: 'tag',
                            value: sharedCategoryNames ? 
                                `Shared categories: ${sharedCategoryNames}${item.sharedCategories.length > 2 ? '...' : ''}` :
                                `${item.sharedCategoryCount} shared categories`
                        };
                        
                        return {
                            id: item.token.id,
                            cmcId: item.token.cmcId,
                            name: item.token.name,
                            symbol: item.token.ticker,
                            price: item.token.price,
                            priceChange: priceChange,
                            matchType: matchLabel,
                            score: (item.similarityScore / item.totalCategoryCount * 10).toFixed(1),
                            meta: metaInfo,
                            chartColor: isPositive ? '#16C784' : '#EA3943',
                            refLineColor: '#616E85',
                            chartData: chartData,
                            sharedCategories: item.sharedCategories
                        };
                    });
                } 
                // Handle new response format with ecosystems
                else if (response.data.similar && Array.isArray(response.data.similar)) {
                    formattedCoins = response.data.similar.map((item: any, index: number) => {
                        const priceChange = getTimeFilteredPriceChange(item.token.priceChange);
                        const isPositive = priceChange >= 0;
                        
                        // Prepare chart data
                        let chartData: any[] = [];
                        if (item.chartData && Array.isArray(item.chartData)) {
                            // Use the chart data from the API
                            chartData = item.chartData
                        } else {
                            // Fallback to empty chart
                            chartData = [];
                        }
                        
                        // Calculate shared category percentage
                        const sharedPercentage = Math.round((item.sharedCategoryCount / item.totalCategoryCount) * 100);
                        const matchLabel = index === 0 ? "Best Match" : 
                                          index === 1 ? "2nd Best Match" : 
                                          index === 2 ? "3rd Best Match" : 
                                          `${sharedPercentage}% Match`;
                        
                        // Format meta info
                        const sharedCategoryNames = item.sharedCategories
                            .filter((cat: any) => cat.name)
                            .map((cat: any) => cat.name)
                            .slice(0, 2)
                            .join(', ');
                        
                        const metaInfo = {
                            type: 'tag',
                            value: sharedCategoryNames ? 
                                `Shared categories: ${sharedCategoryNames}${item.sharedCategories.length > 2 ? '...' : ''}` :
                                `${item.sharedCategoryCount} shared categories`
                        };
                        
                        return {
                            id: item.token.id,
                            cmcId: item.token.cmcId,
                            name: item.token.name,
                            symbol: item.token.ticker,
                            price: item.token.price,
                            priceChange: priceChange,
                            matchType: matchLabel,
                            score: (item.similarityScore / item.totalCategoryCount * 10).toFixed(1),
                            meta: metaInfo,
                            chartColor: isPositive ? '#16C784' : '#EA3943',
                            refLineColor: '#616E85',
                            chartData: chartData,
                            sharedCategories: item.sharedCategories
                        };
                    });
                    
                    // Process ecosystem data if available
                    if (response.data.ecosystem && typeof response.data.ecosystem === 'object') {
                        // Iterate through each ecosystem in the response
                        Object.entries(response.data.ecosystem).forEach(([key, ecosystemObj]: [string, any]) => {
                            if (ecosystemObj.name && ecosystemObj.tokens && Array.isArray(ecosystemObj.tokens)) {
                                // Format ecosystem tokens for CryptoChipCard
                                const formattedTokens = ecosystemObj.tokens.map((token: any) => {
                                    // Get the correct price change based on the active time filter
                                    let priceChange = 0;
                                    if (token.priceChange) {
                                        switch (activeTimeFilter) {
                                            case '7d':
                                                priceChange = token.priceChange.week1 || 0;
                                                break;
                                            case '30d':
                                                priceChange = token.priceChange.month1 || 0;
                                                break;
                                            case '24h':
                                            default:
                                                priceChange = token.priceChange.day1 || 0;
                                                break;
                                        }
                                    }
                                    
                                    return {
                                        id: token.id,
                                        cmcId: token.cmcId,
                                        name: token.name,
                                        ticker: token.ticker,
                                        price: token.price,
                                        priceChange: priceChange
                                    };
                                });
                                
                                // Use ecosystem name as the key, or capitalize the ecosystem key if name is missing
                                const displayName = ecosystemObj.name || key.charAt(0).toUpperCase() + key.slice(1);
                                ecosystems[displayName] = formattedTokens;
                            }
                        });
                    }
                }
                
                setSimilarCoins(formattedCoins);
                setEcosystemCoins(ecosystems);
            }
        } catch (error) {
            console.error('Error fetching similar coins:', error);
            setSimilarCoins([]);
            setEcosystemCoins({});
        } finally {
            setLoading(false);
        }
    }, [coin?.cmcId, activeTimeFilter]);

    // Then in your useEffect
    useEffect(() => {
        fetchSimilarCoins();
    }, [fetchSimilarCoins]);

    // Set first ecosystem as expanded when ecosystemCoins changes
    useEffect(() => {
        const ecosystemKeys = Object.keys(ecosystemCoins);
        if (ecosystemKeys.length > 0) {
            const initialExpanded: {[key: string]: boolean} = {};
            ecosystemKeys.forEach((key, index) => {
                initialExpanded[key] = index === 0; // Only expand the first one
            });
            setExpandedEcosystems(initialExpanded);
        }
    }, [ecosystemCoins]);

    // Toggle expansion of an ecosystem
    const toggleEcosystemExpansion = (ecosystemKey: string) => {
        setExpandedEcosystems(prev => ({
            ...prev,
            [ecosystemKey]: !prev[ecosystemKey]
        }));
    };

    // Process chart data from API to match the component's expected format
    const processChartData = (apiChartData: any[]) => {
        if (!apiChartData || !apiChartData.length) return [];
        
        return apiChartData.map((point, index) => {
            return {
                name: index,
                price: point.value, 
                reference: point.value * (0.95 + Math.random() * 0.1) // Create a reference line that roughly follows the main line
            };
        });
    };
    
    // Get price change based on selected time filter
    const getTimeFilteredPriceChange = (priceChange: any) => {
        if (!priceChange) return 0;
        
        switch (activeTimeFilter) {
            case '7d':
                return priceChange.week1 || 0;
            case '30d':
                return priceChange.month1 || 0;
            case '24h':
            default:
                return priceChange.day1 || 0;
        }
    };

    const CheckmarkIcon = () => (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
    );

    const TagIcon = () => (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
        </svg>
    );

    const formatPrice = (price: number) => {
        if (!price && price !== 0) return '$0.00';
        if (price < 0.01) return `$${price.toFixed(8)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        return `$${price.toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })}`;
    };

    const getMetaIcon = (type: string) => {
        switch (type) {
            case 'watchlist':
                return (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                );
            case 'tag':
                return <TagIcon />;
            case 'marketCap':
                return (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                    </svg>
                );
            case 'listed':
                return (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const getLabelBackground = () => {
        if (theme.name === 'dark') {
            return 'rgba(50, 53, 70, 0.7)';
        }
        return 'rgba(239, 242, 245, 0.9)';
    };

    return (
        <Container>
            <Header>
                <Title>Similar Coins to {coin?.name || 'Bitcoin'}</Title>
            </Header>

            <GridContainer>
                {loading ? (
                    // Loading skeletons
                    Array(6).fill(0).map((_, index) => (
                        <CoinCard 
                            key={`loading-${index}`}
                            className="glass-effect"
                        >
                            <ChartContainer className="glass-chart" />
                            <CoinInfo>
                                <CoinName>
                                    <CoinLogo>-</CoinLogo>
                                    Loading...
                                </CoinName>
                                <PriceContainer>
                                    <Price>$---.--</Price>
                                    <PriceChange isPositive={true}>--.--% </PriceChange>
                                </PriceContainer>
                            </CoinInfo>
                        </CoinCard>
                    ))
                ) : similarCoins.length > 0 ? (
                    similarCoins.map((coinData, index) => (
                        <CustomLink 
                            key={coinData.id || index}
                            href={`/${generateTokenUrl(coinData.name, coinData.symbol)}`}
                            passHref
                            style={{ textDecoration: 'none' }}
                        >
                            <CoinCard 
                                className="glass-effect"
                                style={{ cursor: 'pointer' }}
                            >
                                <ChartContainer className="glass-chart">
                                    {coinData.chartData && coinData.chartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={coinData.chartData}>
                                                {/* Reference line (BTC or comparison coin) */}
                                                <Line
                                                    type="monotone"
                                                    dataKey="reference"
                                                    stroke={coinData.refLineColor}
                                                    strokeWidth={1.5}
                                                    dot={false}
                                                    isAnimationActive={false}
                                                    activeDot={false}
                                                    connectNulls={true}
                                                />
                                                {/* Main price line */}
                                                <Line
                                                    type="monotone"
                                                    dataKey="price"
                                                    stroke={coinData.chartColor}
                                                    strokeWidth={2}
                                                    dot={false}
                                                    isAnimationActive={false}
                                                    connectNulls={true}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            height: '100%',
                                            color: '#616E85',
                                            fontSize: '12px'
                                        }}>
                                            No chart data available
                                        </div>
                                    )}
                                    
                                    {/* Coin ticker labels */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '5px',
                                        right: '5px',
                                        fontSize: '10px',
                                        color: coinData.chartColor,
                                        fontWeight: 'bold',
                                        padding: '3px 6px',
                                        borderRadius: '4px',
                                        background: getLabelBackground(),
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                        zIndex: 15
                                    }}>
                                        {coinData.symbol}
                                    </div>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '5px',
                                        right: '5px',
                                        fontSize: '10px',
                                        color: coinData.refLineColor,
                                        fontWeight: 'bold',
                                        padding: '3px 6px',
                                        borderRadius: '4px',
                                        background: getLabelBackground(),
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                        zIndex: 15
                                    }}>
                                        {coin?.ticker || 'BTC'}
                                    </div>
                                </ChartContainer>

                                <CoinInfo>
                                    <CoinName>
                                        <Image 
                                            src={getCmcImageUrl(coinData.cmcId)} 
                                            alt={coinData.name} 
                                            width={24}
                                            height={24}
                                            style={{ 
                                                marginRight: 8,
                                                borderRadius: '50%'
                                            }} 
                                        /> 
                                        <span style={{ marginLeft: 8 }} />
                                        {coinData.name}
                                    </CoinName>
                                    <PriceContainer>
                                        <Price>
                                            {formatPrice(coinData.price)}
                                        </Price>
                                        <PriceChange isPositive={coinData.priceChange >= 0}>
                                            {coinData.priceChange >= 0 ? "+" : ""}
                                            {typeof coinData.priceChange === 'number' 
                                                ? coinData.priceChange.toFixed(2)
                                                : '0.00'}%
                                        </PriceChange>
                                    </PriceContainer>
                                </CoinInfo>
                            </CoinCard>
                        </CustomLink>
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                        No similar coins found
                    </div>
                )}
            </GridContainer>
            
            {/* Ecosystem Coins Section */}
            {false && Object.keys(ecosystemCoins).length > 0 && 
                Object.entries(ecosystemCoins).map(([ecosystemKey, tokens]) => {
                    let cleanName = ecosystemKey
                        .replace('-ecosystem', '')
                        .replace('ecosystem', '');
                    
                    cleanName = cleanName
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                    
                    const isExpanded = expandedEcosystems[ecosystemKey];
                    
                    return (
                        <div key={ecosystemKey} style={{ 
                            margin: '8px 0px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: theme.name === 'dark' ? '1px solid rgba(70, 73, 90, 0.2)' : '1px solid rgba(230, 232, 235, 0.8)',
                            boxShadow: theme.name === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.05)'
                        }}>
                            <div 
                                style={{ 
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    padding: '10px 14px',
                                    background: theme.name === 'dark' ? 'rgba(50, 53, 70, 0.4)' : 'rgba(239, 242, 245, 0.7)',
                                    transition: 'background-color 0.2s ease',
                                    borderBottom: isExpanded ? (theme.name === 'dark' ? '1px solid rgba(70, 73, 90, 0.2)' : '1px solid rgba(230, 232, 235, 0.8)') : 'none'
                                }}
                                onClick={() => toggleEcosystemExpansion(ecosystemKey)}
                            >
                                <div style={{
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: theme.name === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.75)'
                                }}>
                                    {cleanName} Ecosystem
                                </div>
                                <div style={{ 
                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: theme.name === 'dark' ? 'rgba(60, 63, 80, 0.5)' : 'rgba(229, 232, 235, 0.8)',
                                }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.name === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'} strokeWidth="2">
                                        <path d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {isExpanded && (
                                <div style={{
                                    transition: 'all 0.3s ease-in-out',
                                    padding: '0px 14px',
                                    background: theme.name === 'dark' ? 'rgba(40, 43, 60, 0.2)' : 'rgba(255, 255, 255, 0.7)',
                                }}>
                                    <CryptoChipCard 
                                        heading=""
                                        coins={tokens}
                                    />
                                </div>
                            )}

                        </div>
                    );
                })
            }
        </Container>
    );
};

export default SimilarCrypto;
