import React from 'react';
import { removeHttp } from 'utils/formatLink';
import {
  LinksList,
  SubList,
  SubListWrapper,
  LinkName,
  SubListItem,
} from './LinksSection.styled';

interface NetworkAddress {
  address: string;
  networkType: {
    name: string;
    symbol: string;
  };
}

interface Category {
  category: {
    name: string;
    description: string;
  };
}

interface LinksSectionProps {
  links: {
    website?: string;
    twitter?: string;
    telegram?: string;
    reddit?: string;
  };
  networks?: NetworkAddress[];
  categories?: Category[];
}

const LinksSection = ({ links, networks, categories }: LinksSectionProps) => {
  return (
    <LinksList>
      {links.website && (
        <li>
          <LinkName href={links.website} target="_blank" rel="noopener noreferrer">
            {removeHttp(links.website)}
          </LinkName>
        </li>
      )}
      
      {networks && networks.length > 0 && (
        <SubListWrapper>
          <LinkName>Networks</LinkName>
          <SubList>
            {networks.map((network, index) => (
              <li key={index}>
                <SubListItem>
                  {network.networkType.name}: {network.address}
                </SubListItem>
              </li>
            ))}
          </SubList>
        </SubListWrapper>
      )}

      {categories && categories.length > 0 && (
        <SubListWrapper>
          <LinkName>Categories</LinkName>
          <SubList>
            {categories.map((cat, index) => (
              <li key={index}>
                <SubListItem title={cat.category.description}>
                  {cat.category.name}
                </SubListItem>
              </li>
            ))}
          </SubList>
        </SubListWrapper>
      )}

      <SubListWrapper>
        <LinkName>Community</LinkName>
        <SubList>
          {links.twitter && (
            <li>
              <SubListItem href={links.twitter} target="_blank" rel="noopener noreferrer">
                Twitter
              </SubListItem>
            </li>
          )}
          {links.telegram && (
            <li>
              <SubListItem href={links.telegram} target="_blank" rel="noopener noreferrer">
                Telegram
              </SubListItem>
            </li>
          )}
          {links.reddit && (
            <li>
              <SubListItem href={links.reddit} target="_blank" rel="noopener noreferrer">
                Reddit
              </SubListItem>
            </li>
          )}
        </SubList>
      </SubListWrapper>
    </LinksList>
  );
};

export default LinksSection;
