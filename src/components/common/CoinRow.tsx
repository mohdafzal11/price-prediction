import React from 'react';
import styled from 'styled-components';
import CoinImage from 'components/CoinImage';
import Link from 'next/link';
import CustomLink from 'components/CustomLink/CustomLink';

interface CoinRowProps {
  cmcId?: string | number;
  name: string;
  ticker: string;
  rank?: number;
  url?: string;
  onClick?: () => void;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: ${props => props.onClick ? 'pointer' : 'default'};
`;

const RankBadge = styled.div`
  font-size: 12px;
  color: #999;
  min-width: 20px;
`;

const NameWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.div`
  font-weight: 500;
`;

const Ticker = styled.div`
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
`;

const CoinRow: React.FC<CoinRowProps> = ({
  cmcId,
  name,
  ticker,
  rank,
  url,
  onClick
}) => {
  const content = (
    <Container onClick={onClick}>
      {rank && <RankBadge>{rank}</RankBadge>}
      <CoinImage cmcId={cmcId} name={name} size={24} />
      <NameWrapper>
        <Name>{name}</Name>
        <Ticker>{ticker}</Ticker>
      </NameWrapper>
    </Container>
  );

  if (url) {
    return (
      <CustomLink href={url} style={{ textDecoration: 'none', color: 'inherit' }} is_a={true}>
        {content}
      </CustomLink>
    );
  }

  return content;
};

export default CoinRow; 