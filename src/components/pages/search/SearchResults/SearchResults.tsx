import React from 'react';
import SectionHeader from 'components/SectionHeader/SectionHeader';
import HomeTable from 'components/pages/home/HomeTable/HomeTable';
import { TokenData } from 'pages';
import * as S from './SearchResults.styled';

interface SearchResultsProps {
  query: string;
  results: TokenData[];
  isLoading: boolean;
  error: string | null;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  isLoading,
  error
}) => {
  return (
    <div>
      <SectionHeader
        title={`Search Results for "${query}"`}
        description={`${results.length} results found`}
        showSearch={true}
      />
      
      {isLoading ? (
        <S.LoadingContainer>
          <S.LoadingSpinner />
          <S.LoadingText>Searching...</S.LoadingText>
        </S.LoadingContainer>
      ) : error ? (
        <S.ErrorContainer>
          <S.ErrorIcon>⚠️</S.ErrorIcon>
          <S.ErrorMessage>{error}</S.ErrorMessage>
        </S.ErrorContainer>
      ) : results.length > 0 ? (
        <HomeTable initialTokens={results} />
      ) : (
        <S.NoResultsContainer>
          <S.NoResultsIcon>🔍</S.NoResultsIcon>
          <S.NoResultsTitle>No results found</S.NoResultsTitle>
          <S.NoResultsMessage>
            Try searching for a different cryptocurrency name or symbol
          </S.NoResultsMessage>
        </S.NoResultsContainer>
      )}
    </div>
  );
};

export default SearchResults;
