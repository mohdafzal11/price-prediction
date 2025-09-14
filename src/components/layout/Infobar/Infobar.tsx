import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useThemeContext } from 'src/theme/ThemeProvider';
import { useTheme } from 'styled-components';
import GlobalStatistics from './GlobalStatistics/GlobalStatistics';
import {
	InfobarWrapper,
	InfobarContainer,
	ThemeButton,
} from './Infobar.styled';
import UserDropdown from './UserDropdown/UserDropdown';

const Infobar = () => {
	const [, dispatch] = useThemeContext();
	const { name } = useTheme();

	const handleToggleTheme = () => {
		dispatch('toggle');
	};

	return (
		<InfobarWrapper>
			<InfobarContainer>
				<GlobalStatistics />
				<ThemeButton onClick={handleToggleTheme}>
					<FontAwesomeIcon
						fontSize={18}
						icon={name === 'light' ? faMoon : faSun}
					/>
				</ThemeButton>
				{/* <UserDropdown /> */}
			</InfobarContainer>
		</InfobarWrapper>
	);
};

export default Infobar;
