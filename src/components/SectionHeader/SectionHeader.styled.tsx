import styled from 'styled-components';
import { device } from '../../styles/breakpoints';

export const HeaderContainer = styled.div`
    margin: 32px 0 16px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    @media ${device.mobileL} {
        margin: 24px 0;
        padding: 0 16px;
    }
`;

export const HeaderContent = styled.div`
    display: flex;
    width: 1400px;
    align-items: center;
    margin-bottom: 8px;

    @media ${device.mobileL} {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
`;

export const Title = styled.h1`
    font-size: 24px;
    font-weight: 700;
    color: ${({ theme: { colors } }) => colors.textColor};
    margin: 0;

    @media ${device.mobileL} {
        font-size: 20px;
    }
`;

export const Description = styled.p`
    font-size: 14px;
    color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
    margin: 0;
    line-height: 1.5;
`;
