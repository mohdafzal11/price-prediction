import React from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { generateDummyPriceData } from '../../../../utils/dummyData';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ChartSectionProps {
  name: string;
  prices?: [number, number][];
}

const ChartSection: React.FC<ChartSectionProps> = ({ name, prices }) => {
  const dummyData = React.useMemo(() => {
    if (prices && prices.length > 0) return prices;
    return generateDummyPriceData(30, 95000, 0.02);
  }, [prices]);

  const options: ApexOptions = {
    chart: {
      type: 'area',
      height: 400,
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      background: 'transparent'
    },
    tooltip: {
      theme: 'dark',
      x: {
        show: true,
        format: 'dd MMM yyyy'
      },
      y: {
        formatter: (value) => `$${value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`
      },
      style: {
        fontSize: '12px'
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2,
      colors: ['#2172E5']
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.1,
        stops: [0, 100]
      },
      colors: ['#2172E5']
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false
        }
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#999999',
          fontSize: '12px'
        },
        datetimeFormatter: {
          year: 'yyyy',
          month: "MMM 'yy",
          day: 'dd MMM',
          hour: 'HH:mm'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#999999',
          fontSize: '12px'
        },
        formatter: (value) => `$${value.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        })}`
      }
    }
  };

  const series = [{
    name: name,
    data: dummyData
  }];

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Chart
        options={options}
        series={series}
        type="area"
        height="100%"
        width="100%"
      />
    </div>
  );
};

export default ChartSection;
