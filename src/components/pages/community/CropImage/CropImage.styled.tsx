import styled from 'styled-components';

export const CropperWrapper = styled.div`
	height: 335px;
	position: relative;
`;

export const Modal = styled.div`
	width: 528px;
	max-height: 90vh;
	display: flex;
	flex-direction: column;
	transition: height 0.3s ease-in-out 0s;
	max-width: 100vw;
	position: relative;
	background: ${({ theme: { colors } }) => colors.white};
	border-radius: 16px;
	overflow: hidden;
`;

export const ModalWrapper = styled.div<{ visible: boolean }>`
	position: fixed;
	z-index: 9999;
	width: 100%;
	height: 100%;
	background: ${({ theme: { colors } }) => colors.modal};
	display: flex;
	justify-content: center;
	align-items: center;
	transition: visibility 0.3s ease-in-out 0s, opacity 0.3s ease-in-out 0s,
		transform 0.3s ease-in-out 0s, box-shadow 0.3s ease-in-out 0s;
	top: 0px;
	left: 0px;
	visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
	opacity: ${({ visible }) => (visible ? 1 : 0)};
`;

export const ZoomRange = styled.input`
	position: relative;
	z-index: 100000;
`;

export const CropButton = styled.button`
	position: relative;
`;
