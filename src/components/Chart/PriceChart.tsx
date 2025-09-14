import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import styled from 'styled-components';
import { formatPrice } from 'utils/formatValues';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceChartProps {
  data: [number, number][];
  coinName: string;
  timeframe: string;
}

const PriceChart = ({ data, coinName, timeframe }: PriceChartProps) => {
  if (!data?.length) {
    return <div>No price data available</div>;
  }

  const chartData = {
    labels: data.map(item => {
      const date = new Date(item[0]);
      if (timeframe === '24H') {
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit'
        });
      }
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }),
    datasets: [
      {
        label: `${coinName} Price`,
        data: data.map(item => item[1]),
        fill: true,
        borderColor: '#2172E5',
        backgroundColor: 'rgba(33, 114, 229, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return `$${formatPrice(context.parsed.y)}`;
          },
          title: function(tooltipItems: any) {
            const date = new Date(data[tooltipItems[0].dataIndex][0]);
            if (timeframe === '24H') {
              return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            }
            return date.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            });
          }
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 8,
          color: '#666',
          font: {
            size: 12
          }
        },
      },
      y: {
        position: 'right' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#666',
          font: {
            size: 12
          },
          callback: function(value: any) {
            return '$' + formatPrice(value);
          },
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    hover: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <ChartWrapper>
      <Line data={chartData} options={options} />
    </ChartWrapper>
  );
};

export default PriceChart;

const ChartWrapper = styled.div`
  width: 100%;
  height: 100%;
  min-height: 400px;
  padding: 20px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;
