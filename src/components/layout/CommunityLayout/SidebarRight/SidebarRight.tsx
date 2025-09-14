import React from 'react';
import styled from 'styled-components';
import Trending from '../Trending/Trending';
import { SidebarRightWrapper } from './SidebarRight.styled';

const SidebarRight = () => {
	return (
		<SidebarRightWrapper>
			<Trending />
		</SidebarRightWrapper>
	);
};

export default SidebarRight;
