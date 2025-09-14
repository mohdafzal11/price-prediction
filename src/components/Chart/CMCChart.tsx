import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getApiUrl } from 'utils/config';
import ChartSection from 'components/pages/coin/ChartSection/ChartSection';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


interface CMCChartProps {
  cmcId: string;
  coinName: string;
}

const CMCChart: React.FC<CMCChartProps> = ({ cmcId,coinName }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${getApiUrl("/cmcChart")}`, {
          params: { cmcId }
        });
        
        const labels = response.data.map((item: any) => new Date(item.timestamp).toLocaleDateString());
        const prices = response.data.map((item: any) => item.price);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Price (USD)',
              data: prices,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }
          ]
        });
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setChartData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [cmcId]);

  if (isLoading) return <div>Loading chart...</div>;

  return (
    <div>
      {chartData && <Line data={chartData} />}
      {!chartData && <div><ChartSection name={coinName} prices={chartData} /></div>}
    </div>
  );
};

export default CMCChart;
