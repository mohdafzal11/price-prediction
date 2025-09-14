import React, { useMemo, useState } from "react";
import { useTheme } from "styled-components";
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import { ChartDataPoint } from "types";

type ColorSegment = {
  data: ChartDataPoint[];
  isAbove: boolean;
};

type CoinChartProps = {
  chartData: ChartDataPoint[];
  chartTimeRange: string;
  isLoadingChart: boolean;
  openingPrice: number;
  convertPrice: (price: number) => number;
  getCurrencySymbol: () => string;
};

const CoinChart = ({
  chartData,
  chartTimeRange,
  isLoadingChart,
  openingPrice,
  convertPrice,
  getCurrencySymbol,
}: CoinChartProps) => {
  const theme = useTheme();
  const [activePoint, setActivePoint] = useState(null);

  // Memoize processed chart data to optimize performance
  const processedData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    const maxPoints = 800;
    const step = Math.max(1, Math.ceil(chartData.length / maxPoints));
    return chartData
      .filter((_, index) => index % step === 0)
      .map((item) => ({
        ...item,
        priceVisual: item.price,
      }));
  }, [chartData]);

  // Create continuous segments for gradient fill
  const colorSegments = useMemo(() => {
    const segments: ColorSegment[] = [];
    let currentSegment: ChartDataPoint[] = [];
    let isCurrentlyAbove = processedData[0]?.price >= openingPrice;

    processedData.forEach((point, index) => {
      const isAbove = point.price >= openingPrice;
      const enhancedPoint = { ...point };

      if (index === 0) {
        currentSegment.push(enhancedPoint);
      } else if (isAbove === isCurrentlyAbove) {
        currentSegment.push(enhancedPoint);
      } else {
        const prevPoint = processedData[index - 1];
        const intersectionPoint = {
          ...point,
          price: openingPrice,
          priceVisual: openingPrice,
          timestamp:
            Number(prevPoint.timestamp) +
            (Number(point.timestamp) - Number(prevPoint.timestamp)) * 0.5,
          volume: (prevPoint.volume + point.volume) / 2,
        };

        currentSegment.push(intersectionPoint);
        segments.push({
          data: [...currentSegment],
          isAbove: isCurrentlyAbove,
        } as ColorSegment);

        currentSegment = [intersectionPoint, enhancedPoint];
        isCurrentlyAbove = isAbove;
      }
    });

    if (currentSegment.length > 0) {
      segments.push({
        data: currentSegment,
        isAbove: isCurrentlyAbove,
      });
    }

    return segments;
  }, [processedData, openingPrice]);

  const positiveColor = "#00D4AA";
  const negativeColor = "#F6465D";
  const gridColor = theme.name === "dark" ? "#2D3748" : "#EDF2F7";
  const tooltipBg = theme.name === "dark" ? "#1A202C" : "#FFFFFF";
  const tooltipBorder = theme.name === "dark" ? "#4A5568" : "#E2E8F0";
  const tooltipText = theme.name === "dark" ? "#E2E8F0" : "#2D3748";

  // Handle tooltip and active point update
  const handleMouseMove = (e) => {
    if (e && e.activePayload && e.activePayload.length > 0) {
      setActivePoint(e.activePayload[0].payload);
    } else {
      setActivePoint(null);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        height: "320px",
        width: "100%",
        maxWidth: "100vw",
        overflow: "hidden",
        borderRadius: "16px",
        border: `1px solid ${theme.name === "dark" ? "#2D3748" : "#E2E8F0"}`,
        padding: "0px 8px",
      }}
    >
      {isLoadingChart ? (
        <ChartLoader />
      ) : processedData.length > 0 ? (
        <ResponsiveContainer
          width="100%"
          height="100%"
          key={`chart-${chartTimeRange}`}
        >
          <ComposedChart
            data={processedData}
            margin={{ top: 20, right: -25, left: 10, bottom: 0 }}
            syncId="chart"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setActivePoint(null)}
          >
            <defs>
              <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={positiveColor}
                  stopOpacity={0.35}
                />
                <stop
                  offset="50%"
                  stopColor={positiveColor}
                  stopOpacity={0.15}
                />
                <stop
                  offset="100%"
                  stopColor={positiveColor}
                  stopOpacity={0.03}
                />
              </linearGradient>
              <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={negativeColor}
                  stopOpacity={0.35}
                />
                <stop
                  offset="50%"
                  stopColor={negativeColor}
                  stopOpacity={0.15}
                />
                <stop
                  offset="100%"
                  stopColor={negativeColor}
                  stopOpacity={0.03}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke={gridColor}
              strokeOpacity={theme.name === "dark" ? 0.5  : 0.6}
              horizontal={true}
              vertical={false}
              strokeWidth={1}
            />

            <XAxis
              dataKey="timestamp"
              type="number"
              domain={["dataMin", "dataMax"]}
              scale="time"
              axisLine={true}
              strokeOpacity={theme.name === "dark" ? 0.5 : 0.65}
              strokeWidth={0.5}
              tickLine={false}
              tick={{
                fill: theme.name === "dark" ? "#A0AEC0" : "#718096",
                fontSize: 12,
                fontWeight: 400,
                fontFamily:
                  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
              tickFormatter={(timestamp) => {
                const date = new Date(timestamp);
                if (chartTimeRange === "1d") {
                  return date.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  });
                } else if (chartTimeRange === "7d") {
                  return date.toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                  });
                } else {
                  return date.toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  });
                }
              }}
              interval="preserveStartEnd"
              minTickGap={60}
              tickCount={7}
            >
              <text
                x={500}
                y={280}
                textAnchor="middle"
                fill={theme.name === "dark" ? "#A0AEC0" : "#718096"}
                style={{ fontSize: 12, fontWeight: 500 }}
              >
                Date
              </text>
            </XAxis>

            <YAxis
              yAxisId="price"
              orientation="right"
              axisLine={true}
              tickLine={false}
             stopOpacity={theme.name === "dark" ? 0.5 : 0.65}
              strokeWidth={0.5}

              
              tick={{
                fill: theme.name === "dark" ? "#A0AEC0" : "#718096",
                fontSize: 12,
                fontWeight: 400,
                fontFamily:
                  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
              domain={["dataMin * 0.995", "dataMax * 1.005"]}
              tickFormatter={(value) => {
                try {
                  const numValue = Number(value);
                  if (isNaN(numValue) || numValue <= 0) return "";
                  const converted = convertPrice(numValue);
                  if (converted >= 1e9)
                    return `${(converted / 1e9).toFixed(2)}B`;
                  if (converted >= 1e6)
                    return `${(converted / 1e6).toFixed(2)}M`;
                  if (converted >= 1e3)
                    return `${(converted / 1e3).toFixed(2)}K`;
                  if (converted < 1) return converted.toFixed(6);
                  return converted.toFixed(2);
                } catch (error) {
                  console.error("Y-axis formatting error:", error);
                  return "";
                }
              }}
              width={80}
              tickCount={7}
              type="number"
              allowDataOverflow={false}
              scale="linear"
            >
              <text
                x={70}
                y={10}
                textAnchor="start"
                fill={theme.name === "dark" ? "#A0AEC0" : "#718096"}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  transform: "rotate(-90deg)",
                  transformOrigin: "center",
                }}
              >
                Price (USD)
              </text>
            </YAxis>

            <Tooltip
              content={({ active, payload, coordinate }) => {
                if (!active || !payload || !payload.length) return null;

                const filteredPayload = payload.filter(
                  (item) => item.dataKey !== "priceVisual"
                );
                const isRightHalf =
                  coordinate && coordinate.x && coordinate.x > window.innerWidth / 2;

                return (
                  <div
                    style={{
                      backgroundColor: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: "10px",
                      boxShadow:
                        theme.name === "dark"
                          ? "0 6px 16px rgba(0, 0, 0, 0.5)"
                          : "0 6px 16px rgba(0, 0, 0, 0.1)",
                      padding: "12px 16px",
                      fontSize: "13px",
                      color: tooltipText,
                      fontFamily:
                        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      transform: isRightHalf
                        ? "translateX(-100%)"
                        : "translateX(0)",
                      maxWidth: "200px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div
                      style={{
                        color: tooltipText,
                        fontSize: "12px",
                        marginBottom: "8px",
                        fontWeight: 500,
                      }}
                    >
                      {new Date(payload[0].payload.timestamp).toLocaleString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                    </div>
                    {filteredPayload.map((item, index) => {
                      if (item.dataKey === "price") {
                        const converted = convertPrice(Number(item.value));
                        return (
                          <div
                            key={index}
                            style={{
                              color: tooltipText,
                              fontSize: "14px",
                              fontWeight: 600,
                              marginBottom: "4px",
                            }}
                          >
                            Price: {getCurrencySymbol()}
                            {converted.toLocaleString(undefined, {
                              minimumFractionDigits: converted < 1 ? 6 : 2,
                              maximumFractionDigits: converted < 1 ? 8 : 2,
                            })}
                          </div>
                        );
                      }
                      if (item.dataKey === "volume") {
                        const vol = Number(item.value);
                        let volumeText = "";
                        if (vol >= 1e9)
                          volumeText = `${getCurrencySymbol()}${(
                            vol / 1e9
                          ).toFixed(2)}B`;
                        else if (vol >= 1e6)
                          volumeText = `${getCurrencySymbol()}${(
                            vol / 1e6
                          ).toFixed(2)}M`;
                        else if (vol >= 1e3)
                          volumeText = `${getCurrencySymbol()}${(
                            vol / 1e3
                          ).toFixed(2)}K`;
                        else
                          volumeText = `${getCurrencySymbol()}${vol.toLocaleString()}`;

                        return (
                          <div
                            key={index}
                            style={{
                              color: tooltipText,
                              fontSize: "13px",
                              fontWeight: 500,
                            }}
                          >
                            Volume: {volumeText}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                );
              }}
              cursor={{
                stroke: theme.name === "dark" ? "#718096" : "#A0AEC0",
                strokeWidth: 1,
                strokeOpacity: 0.8,
                strokeDasharray: "3 3",
              }}
              position={{ y: 20 }}
            />

            <Area
              yAxisId="price"
              type="monotoneX"
              dataKey="price"
              stroke="transparent"
              fill="transparent"
              strokeWidth={0}
              dot={false}
              // @ts-ignore
              activeDot={
                activePoint
                  ? {
                      r: 7,
                      fill:
                      // @ts-ignore
                        activePoint.price >= openingPrice
                          ? positiveColor
                          : negativeColor,
                      stroke: theme.name === "dark" ? "#1A202C" : "#F7FAFC",
                      strokeWidth: 2,
                      cx:
                        processedData.findIndex(
                          (d) => d.timestamp === activePoint.timestamp
                        ) *
                          (100 / processedData.length) +
                        "%",
                      cy: `${
                        ((activePoint.price - processedData[0].price) /
                          (processedData[processedData.length - 1].price -
                            processedData[0].price)) *
                        100
                      }%`,
                    }
                  : false
              }
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
              connectNulls={true}
            />

            {colorSegments.map((segment, index) => (
              <Area
                key={`segment-${index}`}
                yAxisId="price"
                type="monotoneX"
                data={segment.data}
                dataKey="priceVisual"
                stroke={segment.isAbove ? positiveColor : negativeColor}
                fill={
                  segment.isAbove
                    ? "url(#positiveGradient)"
                    : "url(#negativeGradient)"
                }
                strokeWidth={2.5}
                dot={false}
                activeDot={false}
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="ease-out"
                connectNulls={true}
                legendType="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                baseValue={openingPrice}
              />
            ))}

            {/* Reference line at opening price */}
            <ReferenceLine
              yAxisId="price"
              y={openingPrice}
              stroke={theme.name === "dark" ? "#A0AEC0" : "#718096"}
              strokeWidth={1}
              strokeDasharray="3 3"
              isFront={true}
           
            />

            {/* Vertical and Horizontal Reference Lines on Hover */}
            <Tooltip
              contentStyle={{ display: "none" }}
              isAnimationActive={false}
            >
              {({ active, payload, coordinate }) => {
                if (active && payload && payload.length && coordinate) {
                  return (
                    <>
                      <ReferenceLine
                        x={coordinate.x}
                        stroke={theme.name === "dark" ? "#718096" : "#A0AEC0"}
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        isFront={true}
                      />
                      <ReferenceLine
                        y={coordinate.y}
                        stroke={theme.name === "dark" ? "#718096" : "#A0AEC0"}
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        isFront={true}
                      />
                    </>
                  );
                }
                return null;
              }}
            </Tooltip>
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.name === "dark" ? "#A0AEC0" : "#718096",
            fontSize: "14px",
            fontWeight: 500,
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <p>No chart data available</p>
        </div>
      )}
    </div>
  );
};

const ChartLoader = () => {
  const theme = useTheme();
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: `4px solid ${
            theme.name === "dark"
              ? "rgba(255, 255, 255, 0.15)"
              : "rgba(0, 0, 0, 0.1)"
          }`,
          borderTop: `4px solid ${theme.colors.textColor}`,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          marginBottom: "16px",
        }}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `,
        }}
      />
      <div
        style={{
          color: theme.name === "dark" ? "#A0AEC0" : "#718096",
          fontSize: "14px",
          fontWeight: 500,
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        Loading chart data...
      </div>
    </div>
  );
};

export default CoinChart;