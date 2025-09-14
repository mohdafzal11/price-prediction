import React from 'react';
import styled from 'styled-components';
import { getPageUrl } from 'utils/config';

interface Product {
  name: string;
  price: number;
  image: string;
}

interface Token {
  id: string;
  name: string;
  ticker: string;
  currentPrice: {
    usd: number;
  };
}

interface PurchasingPowerCardProps {
  token: Token;
}

const PRODUCTS: Product[] = [
  {
    name: 'iPhone 16 Pro Max - 512GB',
    price: 1399,
    image: getPageUrl('/products/iphone16promax.png')
  },
  {
    name: 'PlayStation 5',
    price: 699,
    image: getPageUrl('/products/ps5.png')
  },
  {
    name: 'Xbox Series X - 1TB',
    price: 499,
    image: getPageUrl('/products/xbox.png')
  },
  {
    name: 'MacBook Pro 16" M4 Max',
    price: 3499,
    image: getPageUrl('/products/macbook.png')
  }
];

const PurchasingPowerCard: React.FC<PurchasingPowerCardProps> = ({ token }) => {
  const calculateTokenAmount = (productPrice: number) => {
    const tokenPrice = token.currentPrice.usd;
    if (!tokenPrice || tokenPrice === 0) return 'N/A';
    
    const amount = productPrice / tokenPrice;
    if (amount >= 1) {
      return amount.toFixed(2);
    }
    return amount.toFixed(6);
  };

  return (
    <Wrapper>
      <Title>What Can You Buy With {token.name}?</Title>
      <ProductGrid>
        {PRODUCTS.map((product) => (
          <ProductCard key={product.name}>
            <ProductImage src={product.image} alt={product.name} />
            <ProductInfo>
              <ProductName>{product.name}</ProductName>
              <ProductPrice>${product.price.toLocaleString()}</ProductPrice>
              <TokenAmount>
                ≈ {calculateTokenAmount(product.price)} {token.ticker}
              </TokenAmount>
            </ProductInfo>
          </ProductCard>
        ))}
      </ProductGrid>
    </Wrapper>
  );
};

export default PurchasingPowerCard;

const Wrapper = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px 0;
  color: ${props => props.theme.colors.textColor};
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
`;

const ProductCard = styled.div`
  background: ${props => props.theme.colors.bgColor};
  border: 1px solid ${props => props.theme.colors.borderColor};
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: contain;
  margin-bottom: 16px;
`;

const ProductInfo = styled.div`
  text-align: center;
`;

const ProductName = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: ${props => props.theme.colors.textColor};
`;

const ProductPrice = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 8px;
`;

const TokenAmount = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.theme.colors.textColor};
`;
