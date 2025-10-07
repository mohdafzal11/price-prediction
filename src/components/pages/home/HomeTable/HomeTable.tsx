import Table, { TableColumn } from "components/Table/Table";
import * as S from "./HomeTable.styled";
import PercentageChange from "components/PercentageChange/PercentageChange";
import PriceDisplay from "components/PriceDisplay/PriceDisplay";
import { useMemo, useRef, useEffect } from "react";
import { useTheme } from "styled-components";
import { getCmcImageUrl } from "../../../../utils/config";
import { useCurrency } from "../../../../context/CurrencyContext";
import CustomLink from "components/CustomLink/CustomLink";
import { Token } from "types";
import { TableRow } from "components/CoinMainContent/CoinMainContent.styled";
import { RowSelection } from "@tanstack/react-table";

interface HomeTableProps {
  initialTokens: Token[];
}

const formatNumberWithSuffix = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";

  const thresholds = [
    { value: 1e12, suffix: "T" },
    { value: 1e9, suffix: "B" },
    { value: 1e6, suffix: "M" },
    { value: 1e3, suffix: "K" },
  ];

  for (const { value: threshold, suffix } of thresholds) {
    if (value >= threshold) {
      const formatted = (value / threshold).toFixed(2).replace(/\.?0+$/, "");
      return `${formatted}${suffix}`;
    }
  }
  return value.toString();
};

const SparklineChart = ({ data, color }: { data: number[]; color: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const padding = 5;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;

    data.forEach((point, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y =
        height -
        padding -
        ((point - min) / (range || 1)) * (height - padding * 2);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  }, [data, color]);

  return (
    <canvas
      ref={canvasRef}
      width={150}
      height={38}
      style={{ display: "block" }}
    />
  );
};

const HomeTable: React.FC<HomeTableProps> = ({ initialTokens }) => {
  const {
    colors: { upColor, downColor },
  } = useTheme();

  const { getCurrencySymbol } = useCurrency();

  const columns = useMemo<TableColumn<Token>[]>(
    () => [
      {
        header: "#",
        accessorKey: "rank",
        size: 60,
        textAlign: "left",
      },
      {
        header: "Name",
        accessorKey: "name",
        textAlign: "left",
        cell: ({ row }) => {
          const formattedName = row.original.name
            .toLowerCase()
            .replace(/\s+/g, "-");

          const splitIntoChunks = (text: string, maxLength: number = 15) => {
            if (text.length <= maxLength) return [text];

            const words = text.split(" ");
            if (words.length > 1) {
              const chunks: string[] = [];
              let currentChunk = "";

              words.forEach((word) => {
                if ((currentChunk + " " + word).length <= maxLength) {
                  currentChunk = currentChunk
                    ? `${currentChunk} ${word}`
                    : word;
                } else {
                  if (currentChunk) chunks.push(currentChunk);
                  currentChunk = word;
                }
              });

              if (currentChunk) chunks.push(currentChunk);
              return chunks;
            } else {
              const chunks: string[] = [];
              for (let i = 0; i < text.length; i += maxLength) {
                chunks.push(text.slice(i, i + maxLength));
              }
              return chunks;
            }
          };

          const nameChunks = splitIntoChunks(row.original.name);

          return (
            <CustomLink
              href={row.original.slug}
            >
              <S.NameWrapper>
                <img
                  src={getCmcImageUrl(row.original.cmcId)}
                  width={32}
                  height={32}
                  alt={row.original.name}
                />
                <S.NameContent>
                  {nameChunks.map((chunk, index) => (
                    <S.CoinName key={index}>
                      {chunk}
                      {index === 0 && (
                        <S.CoinSymbol> ({row.original.ticker})</S.CoinSymbol>
                      )}
                    </S.CoinName>
                  ))}
                </S.NameContent>
              </S.NameWrapper>
            </CustomLink>
          );
        },
        size: 180,
      },
      {
        header: "Price",
        accessorKey: "price",
        cell: ({ getValue }) => <PriceDisplay price={getValue<number>()} />,
        size: 130,
      },
      {
        header: "1h %",
        accessorKey: "priceChange.1h",
        cell: ({ getValue }) => (
          <PercentageChange value={getValue<number | null>() ?? 0} />
        ),
        size: 100,
      },
      {
        header: "24h %",
        accessorKey: "priceChange.24h",
        cell: ({ getValue }) => (
          <PercentageChange value={getValue<number | null>() ?? 0} />
        ),
        size: 100,
      },
      {
        header: "7d %",
        accessorKey: "priceChange.7d",
        cell: ({ getValue }) => (
          <PercentageChange value={getValue<number | null>() ?? 0} />
        ),
        size: 100,
      },

      {
        header: "Market Cap",
        accessorKey: "marketCap",
        cell: ({ getValue }) =>
          `${getCurrencySymbol()}${formatNumberWithSuffix(getValue<number>())}`,
        size: 120,
      },
      {
        header: "Volume (24h)",
        accessorKey: "volume24h",
        cell: ({ getValue }) =>
          `${getCurrencySymbol()}${formatNumberWithSuffix(getValue<number>())}`,
        size: 120,
      },
      {
        header: "Circulating Supply",
        accessorKey: "circulatingSupply",
        cell: ({ row }) => (
          <div>
            {formatNumberWithSuffix(row.original.circulatingSupply)}
            &nbsp;
            {row.original.ticker}
          </div>
        ),
        size: 150,
      },
      {
        header: "Sentiment",
        accessorKey: "prediction",
        size: 120,
        textAlign:"center",
        cell: ({ row }) => {
          const sentiment = row.original.prediction.sentiment || "Neutral";
          const sentimentColor = sentiment.toLowerCase().includes("neutral")
            ? "#FFC107"
            : sentiment.toLowerCase().includes("bullish")
            ? "#16c784"
            : "#ea3943";

          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  padding: "1px 8px",
                  borderRadius: "8px",
                  background: sentimentColor,
                }}
              >
                <span>{sentiment}</span>
              </div>
            </div>
          );
        },
      },
      {
        header: "Last 7 Days",
        accessorKey: "lastSevenData",
        cell: ({ row }) => {
          const isPositive = (row.original.priceChange["7d"] || 0) >= 0;
          const chartColor = isPositive ? upColor : downColor;

          const uniqueId = (row.original.cmcId ||
            row.original.ticker ||
            "") as string;
          const seed = uniqueId
            .split("")
            .reduce((sum, char) => sum + char.charCodeAt(0), 0);

          const pseudoRandom = (index: number) => {
            const value = Math.sin(seed + index) * 10000;
            return value - Math.floor(value);
          };

          const baseValue = 100;
          const dataPoints = 20;
          const maxVariation = 30;

          const chartData = Array.from({ length: dataPoints }, (_, index) => {
            const variation =
              Math.floor(pseudoRandom(index) * maxVariation * 2) - maxVariation;
            return baseValue + variation;
          });

          if (isPositive) {
            chartData[chartData.length - 1] = chartData[0] + 10;
          } else {
            chartData[chartData.length - 1] = chartData[0] - 10;
          }

          return (
            <div
              style={{
                padding: "8px 0",
                width: 160,
                height: 48,
                background: "transparent",
                borderRadius: "4px",
              }}
            >
              <SparklineChart data={chartData} color={chartColor} />
            </div>
          );
        },
        size: 170,
      },
    ],

    [upColor, downColor]
  );

  return (
    <Table
      data={initialTokens}
      columns={columns}
      enableSorting={false}
      getRowLink={(row) => `/${row.slug}`}
    />
  );
};

export default HomeTable;
