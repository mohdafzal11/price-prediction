import React, { useState } from 'react';
import styled from 'styled-components';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title: string;
  description?: string;
  items: FAQItem[];
  disclaimer?: string;
}

const FAQContainer = styled.div`
  margin: 2rem 0;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: ${props => props.theme.name === 'dark' ? '#1E2130' : '#F8F9FA'};
`;

const FAQTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.name === 'dark' ? '#FFFFFF' : '#000000'};
`;

const FAQDescription = styled.p`
  margin-top: 16px;
  margin-bottom: 16px;
  color: ${props => props.theme.name === 'dark' ? '#B4B9C6' : '#4A4A4A'};
`;

const FAQList = styled.div`
  margin-top: 1.5rem;
`;

const FAQItemContainer = styled.div`
  margin-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.name === 'dark' ? '#2D3348' : '#E9ECEF'};
  &:last-child {
    border-bottom: none;
  }
`;

const FAQQuestionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  cursor: pointer;
`;

const FAQQuestion = styled.h3`
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
  color: ${props => props.theme.name === 'dark' ? '#FFFFFF' : '#000000'};
`;

const FAQToggle = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme.name === 'dark' ? '#858CA2' : '#6C757D'};
`;

const FAQAnswer = styled.div<{ isOpen: boolean }>`
  padding: ${props => props.isOpen ? '0 0 1rem 0' : '0'};
  max-height: ${props => props.isOpen ? '1000px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  color: ${props => props.theme.name === 'dark' ? '#B4B9C6' : '#4A4A4A'};
`;

const FAQDisclaimer = styled.div`
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: ${props => props.theme.name === 'dark' ? '#858CA2' : '#6C757D'};
  font-style: italic;
`;

const FAQSection: React.FC<FAQSectionProps> = ({ title, description, items, disclaimer }) => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    if (openItems.includes(index)) {
      setOpenItems(openItems.filter(item => item !== index));
    } else {
      setOpenItems([...openItems, index]);
    }
  };

  return (
    <FAQContainer itemScope itemType="https://schema.org/FAQPage">
      <FAQTitle>{title}</FAQTitle>
      {description && <FAQDescription dangerouslySetInnerHTML={{ __html: description }} />}
      
      <FAQList>
        {items.map((item, index) => (
          <FAQItemContainer 
            key={index} 
            itemScope 
            itemType="https://schema.org/Question"
            itemProp="mainEntity"
          >
            <FAQQuestionRow onClick={() => toggleItem(index)}>
              <FAQQuestion itemProp="name">{item.question}</FAQQuestion>
              <FAQToggle>{openItems.includes(index) ? '-' : '+'}</FAQToggle>
            </FAQQuestionRow>
            
            <FAQAnswer 
              isOpen={openItems.includes(index)}
              itemScope
              itemType="https://schema.org/Answer"
              itemProp="acceptedAnswer"
            >
              <div itemProp="text" dangerouslySetInnerHTML={{ __html: item.answer }} />
            </FAQAnswer>
          </FAQItemContainer>
        ))}
      </FAQList>
      
      {disclaimer && <FAQDisclaimer>{disclaimer}</FAQDisclaimer>}
    </FAQContainer>
  );
};

export default FAQSection;
