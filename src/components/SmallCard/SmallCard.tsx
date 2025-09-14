import { useState, useRef, useEffect } from 'react';
import {
    SmallCardWrapper,
    GridContainer,
    GridItem
} from './SmallCard.styled';
import { useTheme } from 'styled-components';
import { formatNumberToHumanNotation } from 'utils/formatValues';
import { useCurrency } from '../../context/CurrencyContext';

interface FearAndGreedGaugeProps {
    value: number;
    status: string;
}

const getPositionOnArc = (value: number) => {
    const angle = ((value - 0) / 100) * 180 - 90;
    const radius = 30;
    const centerX = 50;
    const centerY = 35;

    const x = centerX + radius * Math.cos((angle * Math.PI) / 180);
    const y = centerY + radius * Math.sin((angle * Math.PI) / 180);

    return { x, y };
};

const FearAndGreedGauge = ({ value, status }: FearAndGreedGaugeProps) => {
    const theme = useTheme();
    const calculateNeedlePosition = (val: number) => {
        const angle = ((value - 50) / 100) * 180;

        const centerX = 65;
        const centerY = 71;

        const radius = 53;

        const x = centerX + radius * Math.cos(angle);
        const y = centerY - radius * Math.sin(angle);

        return { x, y };
    };

    const { x, y } = calculateNeedlePosition(value);

    const angle = 180 - ((value / 100) * 180);
    const radius = 3;
    const centerX = 32;
    const centerY = 32;

    const pointerX = centerX + radius * Math.cos((angle * Math.PI) / 180);
    const pointerY = centerY - radius * Math.sin((angle * Math.PI) / 180);

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <svg width="130" height="80" viewBox="0 0 130 80">
                <path
                    d="M 12 71 A 53 53 0 0 1 18.91676873622339 44.82108107103576"
                    stroke="#FF0000"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                />

                <path
                    d="M 23.008648902174897 38.66230631323281 A 53 53 0 0 1 44.46167391803855 22.141252965809464"
                    stroke="#FF6600"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                />

                <path
                    d="M 51.46137482940311 19.75836040396365 A 53 53 0 0 1 78.5386251705969 19.75836040396365"
                    stroke="#FFCC00"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                />

                <path
                    d="M 85.53832608196146 22.14125296580947 A 53 53 0 0 1 106.99135109782512 38.662306313232826"
                    stroke="#99FF00"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                />

                <path
                    d="M 111.08323126377661 44.82108107103576 A 53 53 0 0 1 118 71"
                    stroke="#00FF00"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                />

                <circle
                    cx={pointerX}
                    cy={pointerY}
                    r="5"
                    fill={theme.colors.textColor}
                    stroke="#000000"
                    strokeWidth="1.5"
                />

                <text
                    x="65"
                    y="55"
                    textAnchor="middle"
                    fill={theme.colors.textColor}
                    fontSize="24"
                    fontWeight="bold"
                >
                    {value}
                </text>

                <text
                    x="65"
                    y="75"
                    textAnchor="middle"
                    fill="#7D7D7D"
                    fontSize="14"
                >
                    {status}
                </text>
            </svg>
        </div>
    );
};

interface MetricItem {
    title: string;
    value: string;
    change?: string;
    isPositive?: boolean;
    subtitle?: string;
    graphData?: { value: number }[];
    icon?: string;
    icons?: {
        btc: string;
        eth: string;
    };
    dominanceValues?: {
        btc?: string;
        eth?: string;
    };
}

const MiniChart = ({ data, positive }: { data: { value: number }[], positive: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        if (!canvasRef.current || !data.length) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const width = canvas.width;
        const height = canvas.height;
        const padding = 2;
        
        // Extract values for easier processing
        const values = data.map(item => item.value);
        
        // Find min and max to scale the data
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1; // Avoid division by zero
        
        // Draw the line
        ctx.beginPath();
        ctx.strokeStyle = positive ? "#16C784" : "#EA3943";
        ctx.lineWidth = 1.5;
        
        values.forEach((value, i) => {
            const x = padding + (i / (values.length - 1)) * (width - padding * 2);
            // Scale the y value to fit the canvas height with padding
            const y = height - padding - ((value - min) / range) * (height - padding * 2);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }, [data, positive]);
    
    return (
        <canvas 
            ref={canvasRef}
            width={100}
            height={30}
            style={{ display: 'block' }}
        />
    );
};

export default function SmallCard({ info }: { info: any }) {
    const { formatPrice, getCurrencySymbol } = useCurrency();
    
    // Initialize with empty metrics
    const [metrics, setMetrics] = useState<MetricItem[]>([]);
    
    // Update metrics when info changes
    useEffect(() => {
        if (info) {
            setMetrics([
                {
                    title: "Market Cap",
                    value: `${getCurrencySymbol()}${formatNumberToHumanNotation(info?.marketcap?.value || 0, 2)}`,
                    change: `${(info?.marketcap?.change || 0).toFixed(2)}%`,
                    isPositive: (info?.marketcap?.change || 0) > 0,
                    graphData: [
                        { value: 30 }, { value: 35 }, { value: 32 },
                        { value: 40 }, { value: 38 }, { value: 42 }
                    ]
                },
                {
                    title: "Fear & Greed",
                    value: `${info?.fear_and_greed?.value || 0}`,
                    subtitle: info?.fear_and_greed?.classification || 'Neutral',
                },
                {
                    title: "Market Dominance",
                    value: "",
                    icons: {
                        btc: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
                        eth: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"
                    },
                    dominanceValues: {
                        btc: (info?.dominance?.btc || 0).toFixed(2),
                        eth: (info?.dominance?.eth || 0).toFixed(2)
                    }
                },
                {
                    title: "Volume",
                    value: `${getCurrencySymbol()}${formatNumberToHumanNotation(info?.volume?.value || 0, 2)}`,
                    change: `${(info?.volume?.change || 0).toFixed(2)}%`,
                    isPositive: (info?.volume?.change || 0) > 0,
                    graphData: [
                        { value: 25 }, { value: 40 }, { value: 35 },
                        { value: 45 }, { value: 30 }, { value: 35 }
                    ]
                }
            ]);
        }
    }, [info, getCurrencySymbol]);

    const renderGraph = (data: { value: number }[], positive: boolean) => (
        <div className="graph" style={{ marginTop: '4px' }}>
            <MiniChart data={data} positive={positive} />
        </div>
    );

    return (
        <SmallCardWrapper>
            <GridContainer>
                {metrics.map((metric, index) => (
                    <GridItem key={index} positive={metric.isPositive}>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'space-between' ,width: '100%' }}>
                            <div className="title">{metric.title}</div>
                            {metric.change &&   <div className="change">
                               <span style={{ fontSize: '10px' }}>{metric.isPositive ? '▲' : '▼'}</span> {metric.change}
                            </div>}
                        </div>
                        <div className="value-container" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div className="value-section">
                                <div className="value">
                                    {!metric.icon && metric.title !== "Fear & Greed" ? metric.value : ""}
                                </div>
                                {metric.icon && (
                                    <div className="subtitle" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'start', gap: '4px' }}>
                                            <img
                                                style={{ width: 20, height: 20 }}
                                                alt={metric.title.split(' ')[0]}
                                                className="crypto-icon"
                                            />
                                            <span className="dominance-value">{metric.value}</span>
                                        </div>
                                    </div>
                                )}
                                {metric.subtitle && (
                                    <div className="subtitle">
                                        {metric.title === "Fear & Greed" ? (
                                            <FearAndGreedGauge
                                                value={parseInt(metric.value)}
                                                status={metric.subtitle}
                                            />
                                        ) : (
                                            metric.subtitle
                                        )}
                                    </div>
                                )}
                            </div>
                            {metric.icons && (
                                <div style={{ width: '100%' }}>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        marginLeft: '0'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            width: '100%'
                                        }}>
                                            <img
                                                style={{ width: 28, height: 28 }}
                                                src={metric.icons.btc}
                                                alt="BTC"
                                            />
                                            <span className="dominance-value" style={{ fontSize: '22px', fontWeight: 800 }}>{metric.dominanceValues?.btc}%</span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            width: '100%'
                                        }}>
                                            <img
                                                style={{ width: 28, height: 28 }}
                                                src={metric.icons.eth}
                                                alt="ETH"
                                            />
                                            <span className="dominance-value" style={{ fontSize: '22px', fontWeight: 800 }}>{metric.dominanceValues?.eth}%</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {metric.graphData && (
                                <div className="graph-container" >
                                    {renderGraph(metric.graphData, metric.isPositive || false)}
                                </div>
                            )}
                        </div>
                    </GridItem>
                ))}
            </GridContainer>
        </SmallCardWrapper>
    );
}