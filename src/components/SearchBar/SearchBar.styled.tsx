import styled, { keyframes } from 'styled-components';
import { device } from '../../styles/breakpoints';

export const SearchContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
    position: relative;
    width: 300px;
    z-index: 999999999999999999;

    @media ${device.mobileL} {
        margin-left: 0;
        width: 100%;
    }
`;

export const SearchWrapper = styled.div`
    position: relative;
    width: 100%;
    z-index: 99999;
`;

const spin = keyframes`
    to { transform: rotate(360deg); }
`;

export const SearchInput = styled.input`
    width: 100%;
    padding: 8px 12px;
    padding-right: 36px;
    border-radius: 6px;
    border: 1px solid transparent;
    background: ${({ theme: { colors } }) => colors.bgColor};
    color: ${({ theme: { colors } }) => colors.textColor};
    font-size: 14px;
    line-height: 20px;
    margin: 0;
    height: 36px;
    box-sizing: border-box;
    outline: none;
    transition: all 0.2s ease;
    position: relative;
    z-index: 99999;
    
    box-shadow: ${({ theme: { name, colors } }) => 
        name === 'light' 
        ? '0 0 8px rgba(160, 160, 160, 0.9), inset 0 0 0 1px rgba(180, 180, 180, 1), 0 0 4px rgba(200, 200, 200, 0.8)' 
        : '0 0 5px rgba(130, 130, 130, 0.7), inset 0 0 0 1px rgba(160, 160, 160, 0.8), 0 0 2px rgba(180, 180, 180, 0.5)'
    };
    
    background-clip: padding-box;

    &:focus {
        border-width: 1px;
        box-shadow: ${({ theme: { name, colors } }) => 
            name === 'light' 
            ? '0 0 12px rgba(160, 160, 160, 1), inset 0 0 0 1px rgba(180, 180, 180, 1), 0 0 6px rgba(200, 200, 200, 0.9)' 
            : '0 0 8px rgba(150, 150, 150, 0.9), inset 0 0 0 1px rgba(180, 180, 180, 1), 0 0 3px rgba(200, 200, 200, 0.7)'
        };
    }

    &::placeholder {
        color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
    }
`;

export const SearchIcon = styled.div`
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
`;

export const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid ${({ theme: { colors } }) => colors.colorLightNeutral3};
    border-top-color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
    border-radius: 50%;
    animation: ${spin} 0.8s linear infinite;
`;

export const ResultsDropdown = styled.div`
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: ${({ theme: { colors } }) => colors.bgColor};
    border: 1px solid ${({ theme: { colors } }) => colors.borderColor};
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 999999;
    max-height: 300px;
    overflow-y: auto;
    padding: 4px 0;
    width: 100%;
`;

export const LoadingText = styled.div`
    padding: 8px 12px;
    color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
    font-size: 12px;
    text-align: center;
`;

export const NoResults = styled(LoadingText)``;

export const ResultItem = styled.a`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    text-decoration: none;
    color: ${({ theme: { colors } }) => colors.textColor};
    transition: background-color 0.2s ease;
    position: relative;

    &:hover {
        background: ${({ theme: { colors } }) => colors.colorNeutral1};
    }
`;

export const ResultIcon = styled.div`
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    border-radius: 50%;
    overflow: hidden;
    background: #f9f9f9;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
`;

export const ResultInfo = styled.div`
    flex: 1;
    min-width: 0;
    position: relative;
`;

export const ResultName = styled.div`
    font-weight: 600;
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const ResultTicker = styled.div`
    color: #94A3B8;
    font-size: 11px;
`;

export const ViewAllButton = styled.button`
    width: 100%;
    padding: 8px 12px;
    background: none;
    border: none;
    border-top: 1px solid #F1F5F9;
    color: #64748B;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
        background: ${props => props.theme.colors.colorNeutral1};
        color: ${props => props.theme.colors.textColor};
    }
`;
