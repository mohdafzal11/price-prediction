import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as S from './SearchBar.styled';
import { useRouter } from 'next/router';
import debounce from 'lodash/debounce';
import axios from 'axios';
import Link from 'next/link';
import { generateTokenUrl } from '../../utils/url';
import { getApiUrl, getCmcImageUrl, getPageUrl } from '../../utils/config';
import { ThemeProvider, useTheme } from 'styled-components';
import ReactDOM from 'react-dom/client';


let searchBarPortalRoot: HTMLDivElement | null = null;
if (typeof document !== 'undefined') {
  searchBarPortalRoot = document.getElementById('search-bar-portal-root') as HTMLDivElement;
  if (!searchBarPortalRoot) {
    searchBarPortalRoot = document.createElement('div');
    searchBarPortalRoot.id = 'search-bar-portal-root';
    searchBarPortalRoot.style.position = 'absolute';
    searchBarPortalRoot.style.top = '0';
    searchBarPortalRoot.style.left = '0';
    searchBarPortalRoot.style.width = '100%';
    searchBarPortalRoot.style.height = '0';
    searchBarPortalRoot.style.overflow = 'visible';
    searchBarPortalRoot.style.pointerEvents = 'none';
    searchBarPortalRoot.style.zIndex = '9999999';
    document.body.appendChild(searchBarPortalRoot);
  }
}

interface SearchBarProps {
    placeholder?: string;
}

interface TokenSearchResult {
    id: string;
    name: string;
    ticker: string;
    cmcId: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Search assets...' }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<TokenSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const theme = useTheme();
    const [dropdownElement, setDropdownElement] = useState<HTMLDivElement | null>(null);

    // Create dropdown element when needed
    useEffect(() => {
        if (showResults && searchTerm.trim() && !dropdownElement && searchBarPortalRoot) {
            const element = document.createElement('div');
            element.style.position = 'absolute';
            element.style.pointerEvents = 'auto';
            searchBarPortalRoot.appendChild(element);
            setDropdownElement(element);
            
            return () => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
                setDropdownElement(null);
            };
        }
    }, [showResults, searchTerm]);

    // Update dropdown position
    useEffect(() => {
        if (showResults && searchTerm.trim() && inputRef.current && dropdownElement) {
            const updatePosition = () => {
                const rect = inputRef.current!.getBoundingClientRect();
                const top = rect.bottom + window.scrollY + 4;
                const left = rect.left;
                const width = rect.width;
                
                dropdownElement.style.top = `${top}px`;
                dropdownElement.style.left = `${left}px`;
                dropdownElement.style.width = `${width}px`;
            };
            
            updatePosition();
            window.addEventListener('scroll', updatePosition);
            window.addEventListener('resize', updatePosition);
            
            return () => {
                window.removeEventListener('scroll', updatePosition);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [showResults, searchTerm, dropdownElement]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node) &&
                dropdownElement && !dropdownElement.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownElement]);

    const debouncedSearch = useCallback(
        debounce(async (term: string) => {
            if (!term.trim()) {
                setResults([]);
                setIsLoading(false);
                return;
            }

            if (typeof window === 'undefined') {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                console.log('Searching with URL:', getApiUrl(`/search?q=${encodeURIComponent(term)}`));
                const response = await axios.get(getApiUrl(`/search?q=${encodeURIComponent(term)}`));
                console.log('Search response:', response.data);
                
                const searchResults = response.data.slice(0, 5);
                setResults(searchResults);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 700), // Increased debounce time to 2 seconds
        []
    );

    const handleFocus = () => {
        console.log('SearchBar input focused');
        if (searchTerm.trim() && results.length > 0) {
            setShowResults(true);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        console.log('Search input changed:', value);
        setSearchTerm(value);
        
        if (value.trim()) {
            setShowResults(true);
            setIsLoading(true); // Show loading indicator immediately
            debouncedSearch(value);
        } else {
            setShowResults(false);
            setResults([]);
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            console.log('Enter pressed, navigating to search page');
            setShowResults(false);
            router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    const handleResultClick = (result: TokenSearchResult) => {
        console.log('Result clicked:', result);
        setShowResults(false);
        const url = `/${generateTokenUrl(result.name, result.ticker)}`;
        console.log('Navigating to:', url);
        router.push(url);
    };

    const handleViewAllClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowResults(false);
        router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    };

    useEffect(() => {
        if (dropdownElement && theme && showResults && searchTerm.trim()) {
            const bgColor = theme.colors.bgColor;
            const borderColor = theme.colors.borderColor;
            
            const content = (
                <ThemeProvider theme={theme}>
                    <div 
                        style={{
                            position: 'absolute',
                            background: bgColor,
                            border: `1px solid ${borderColor}`,
                            borderRadius: '6px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            padding: '4px 0',
                            width: '100%',
                            zIndex: 999
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {isLoading ? (
                            <S.LoadingText>Searching...</S.LoadingText>
                        ) : results.length > 0 ? (
                            <>
                                {results.map((result) => (
                                    <S.ResultItem 
                                        key={result.id}
                                        href={`/${generateTokenUrl(result.name, result.ticker)}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleResultClick(result);
                                        }}
                                    >
                                        <S.ResultIcon>
                                            <img 
                                                src={getCmcImageUrl(result.cmcId)}
                                                alt={result.name}
                                            />
                                        </S.ResultIcon>
                                        <S.ResultInfo>
                                            <S.ResultName>{result.name}</S.ResultName>
                                            <S.ResultTicker>{result.ticker}</S.ResultTicker>
                                        </S.ResultInfo>
                                    </S.ResultItem>
                                ))}
                                <S.ViewAllButton onClick={handleViewAllClick}>
                                    View all results
                                </S.ViewAllButton>
                            </>
                        ) : (
                            <S.NoResults>No results found</S.NoResults>
                        )}
                    </div>
                </ThemeProvider>
            );
            
            const root = ReactDOM.createRoot(dropdownElement);
            root.render(content);
        }
    }, [dropdownElement, results, isLoading, searchTerm, showResults, theme]);

    return (
        <S.SearchContainer 
            ref={searchRef}
            style={{
                position: 'relative',
                width: '100%', 
                maxWidth: '300px',
                zIndex: 999,
            }}
        >
            <S.SearchWrapper>
                <S.SearchInput
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleSearch}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                />
                <S.SearchIcon>
                    {isLoading ? (
                        <S.LoadingSpinner />
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M16.5 16.5L12.875 12.875M14.8333 8.16667C14.8333 11.8486 11.8486 14.8333 8.16667 14.8333C4.48477 14.8333 1.5 11.8486 1.5 8.16667C1.5 4.48477 4.48477 1.5 8.16667 1.5C11.8486 1.5 14.8333 4.48477 14.8333 8.16667Z" 
                                stroke="currentColor" 
                                strokeWidth="1.66667" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            />
                        </svg>
                    )}
                </S.SearchIcon>
            </S.SearchWrapper>
        </S.SearchContainer>
    );
};

export default SearchBar;
