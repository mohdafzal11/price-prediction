import styled from 'styled-components';

export const SearchContainer = styled.div`
	padding: 24px 32px 8px;
	display: flex;
`;
export const SearchButton = styled.button`
	background: ${({ theme: { colors } }) => colors.themeColor};
	height: 48px;
	width: 0px;
	border-radius: 8px;
	font-size: 14px;
	line-height: 24px;
	font-weight: 600;
	color: white;
	margin-left: 16px;
	overflow: hidden;
`;

export const Search = styled.input`
	background: ${({ theme: { colors } }) => colors.colorLightNeutral2};
	width: 100%;
	border: none;
	height: 48px;
	line-height: 21px;
	outline: none;
	transition: width 0.15s ease;
	border-radius: 8px;
	padding-left: 20px;
	color: ${({ theme: { colors } }) => colors.textColor};

	&::placeholder {
		font-size: 16px;
		font-weight: 500;
		color: ${({ theme: { colors } }) => colors.textColor};
		opacity: 0.4;
	}
	&:focus {
		outline: 1px solid ${({ theme: { colors } }) => colors.themeColor};
		width: calc(100% - 117px);
	}
	&:focus + ${SearchButton} {
		display: block;
		width: 101px;
		transition: width 0s ease 0.15s;
	}
`;
