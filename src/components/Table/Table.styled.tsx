import styled from 'styled-components';
import { device } from '../../styles/breakpoints';

export const TableWrapper = styled.div`
    overflow-x: auto;
    margin: 0 auto;
    width: 100%;
    position: relative;

    ::-webkit-scrollbar {
        height: 6px;
        background-color: transparent;
    }
    ::-webkit-scrollbar-thumb {
        border-radius: 3px;
        background: ${({ theme: { colors } }) => colors.colorLightNeutral3};
    }

    @media ${device.mobileL} {
        &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 180px;
            height: 100%;
            width: 1px;
            background: ${({ theme: { colors } }) => colors.borderColor};
            z-index: 1;
        }
    }
`;

export const Table = styled.table`
    width: 100%;
    border-spacing: 0px;
    position: relative;
    border-collapse: collapse;
    table-layout: fixed;

    tr {
        text-align: right;
        &:hover td {
            background: ${({ theme: { colors } }) => colors.colorNeutral1};
        }
    }

    td, th {
        padding: 16px;
        font-size: 14px;
        line-height: 24px;
        font-weight: 600;
        white-space: nowrap;
        border-bottom: 1px solid ${({ theme: { colors } }) => colors.borderColor};
        background: ${({ theme: { colors } }) => colors.bgColor};
    }

    th {
        font-weight: 500;
        color: ${({ theme: { colors } }) => colors.colorLightNeutral5};
    }

    td:first-child,
    td:nth-child(2) {
        text-align: left;
    }

    @media ${device.mobileL} {
        th:first-child,
        td:first-child {
            display: none;
        }

        th:nth-child(2),
        td:nth-child(2) {
            position: sticky;
            left: 0;
            z-index: 2;
            width: 180px;
            min-width: 180px;
            max-width: 180px;
            background: ${({ theme: { colors } }) => colors.bgColor};
            &::after {
                content: '';
                position: absolute;
                top: 0;
                right: 0;
                height: 100%;
                width: 16px;
                background: linear-gradient(to right, ${({ theme: { colors } }) => colors.bgColor}, transparent);
            }
        }

        th:nth-child(2) {
            text-align: left !important;
        }
    }
`;
