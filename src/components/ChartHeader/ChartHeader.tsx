import React from 'react';
import { useTheme } from 'styled-components';
import { 
  HeaderWrapper, 
  RightControls, 
  TimeButton, 
  ButtonGroup 
} from './ChartHeader.styled';

interface ChartHeaderProps {
  onTimeRangeChange: (timeRange: string) => void;
  currentTimeRange: string;
  isMobile?: boolean;
}

const ChartHeader: React.FC<ChartHeaderProps> = ({ 
  onTimeRangeChange,
  currentTimeRange = '3m',
  isMobile = false
}) => {
  const theme = useTheme();
  const timeRanges = [
    { label: '1D', value: '1d' },
    { label: '7D', value: '7d' },
    { label: '1M', value: '1m' },
    { label: '3M', value: '3m' }
  ];

  return (
    <HeaderWrapper>
      <RightControls>
        <ButtonGroup>
          {timeRanges.map((range) => (
            <TimeButton 
              key={range.value}
              $active={currentTimeRange === range.value}
              onClick={() => onTimeRangeChange(range.value)}
            >
              {range.label}
            </TimeButton>
          ))}
        </ButtonGroup>
      </RightControls>
    </HeaderWrapper>
  );
};

export default ChartHeader; 