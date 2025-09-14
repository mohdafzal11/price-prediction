import React, { ComponentType, ReactElement } from 'react';
import SidebarLeft from './SidebarLeft/SidebarLeft';
import SidebarRight from './SidebarRight/SidebarRight';
import {
	CommunityLayoutWrapper,
	CommunityLayoutContainer,
	MainWrapper,
} from './CommunityLayout.styled';

const CommunityLayout: ComponentType<{ children: ReactElement }> = ({
	children,
}) => {
	return (
		<CommunityLayoutWrapper>
			<CommunityLayoutContainer>
				<SidebarLeft />
				<MainWrapper>{children}</MainWrapper>
				<SidebarRight />
			</CommunityLayoutContainer>
		</CommunityLayoutWrapper>
	);
};

export default CommunityLayout;
