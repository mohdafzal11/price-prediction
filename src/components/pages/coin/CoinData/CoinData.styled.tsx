import styled from 'styled-components';
import { Container } from 'styled/elements/Container';

export const SectionsWrapper = styled(Container)`
	padding-top: 24px;
	display: grid;
	@media screen and (min-width: 768px) {
		grid-template-columns: repeat(2, 1fr);
	}
	@media screen and (min-width: 1200px) {
		grid-template-columns: repeat(3, 1fr);
	}
`;
