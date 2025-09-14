import styled from 'styled-components';

export const ProfileWrapper = styled.div`
	padding: 20px;
`;

export const ProfileData = styled.div`
	display: flex;
`;
export const ProfileContent = styled.div`
	display: flex;
	justify-content: space-between;
	flex-grow: 2;
`;
export const ProfileNameWrapper = styled.div`
	margin-top: 40px;
	margin-left: 32px;
`;
export const EditButtonWrapper = styled.a`
	margin-top: 74px;
`;
export const EditButton = styled.button`
	height: 40px;
	padding: 0px 10px;
	border-radius: 8px;
	border: 1px solid ${({ theme: { colors } }) => colors.colorLightNeutral3};
	color: ${({ theme: { colors } }) => colors.textColor};
`;
export const EditButtonText = styled.span`
	margin-left: 10px;
`;
export const ProfileDisplayName = styled.p`
	font-size: 18px;
	line-height: 1.5;
	font-weight: 600;
`;
export const ProfileName = styled.p`
	font-size: 14px;
	color: ${({ theme: { colors } }) => colors.colorNeutral5};
	line-height: 1.5;
	font-weight: 400;
`;
export const ProfileStatisticWrapper = styled.div`
	margin-top: 8px;
	display: flex;
	gap: 10px;
`;
export const ProfileStatistic = styled.span`
	font-size: 14px;
`;
export const StatisticNumber = styled.span`
	font-weight: 600;
	margin-right: 4px;
`;
export const ProfileJoined = styled.p`
	color: ${({ theme: { colors } }) => colors.colorNeutral5};
	font-size: 14px;
	line-height: 1.5;
	font-weight: 500;
	margin-top: 12px;
`;

export const ImageWrapper = styled.div`
	padding: 10px;
`;
