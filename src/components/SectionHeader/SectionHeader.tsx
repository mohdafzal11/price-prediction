import React from 'react';
import * as S from './SectionHeader.styled';
import SearchBar from '../SearchBar/SearchBar';

interface SectionHeaderProps {
  title: string;
  description?: string;
  showSearch?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  description = '', 
  showSearch = false 
}) => {
  return (
    <S.HeaderContainer>
      <S.HeaderContent>
        <S.Title>{title}</S.Title>
        {showSearch && <SearchBar />}
      </S.HeaderContent>
      {description && <S.Description>{description}</S.Description>}
    </S.HeaderContainer>
  );
};

export default SectionHeader;
