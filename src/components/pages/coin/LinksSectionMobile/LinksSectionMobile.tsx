import { faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { CoinLinks } from 'pages/coins/[slug]';
import {
	LinksSectionWrapper,
	LinksSectionName,
	SectionHeader,
	LinksListWrapper,
	ListHeader,
	ListHeading,
	LinksList,
	LinksContainer,
	CoinLink,
} from 'components/pages/coin/LinksSectionMobile/LinksSectionMobile.styled';
import { removeHttp } from 'utils/formatLink';

interface LinksSectionMobileProps {
	links: CoinLinks;
	name: string;
}

const LinksSectionMobile = ({ links, name }: LinksSectionMobileProps) => {
	const [openList, setOpenList] = useState<boolean>(false);

	const openLinksList = () => {
		setOpenList(true);
	};

	const closeLinksList = () => {
		setOpenList(false);
	};

	useEffect(() => {
		document.body.style.overflow = `${openList ? 'hidden' : ''}`;
	}, [openList]);

	return (
		<LinksSectionWrapper>
			<SectionHeader>
				<p>Links</p>
				<p onClick={openLinksList}>Website, Explorers, Socials etc.</p>
			</SectionHeader>
			<LinksListWrapper isOpen={openList}>
				<ListHeader>
					<ListHeading>{name} Links</ListHeading>
					<button onClick={closeLinksList}>
						<FontAwesomeIcon icon={faX} />
					</button>
				</ListHeader>
				<LinksList>
					<LinksContainer>
						<LinksSectionName>Links</LinksSectionName>
						<CoinLink href={links.homepage[0]}>
							{removeHttp(links.homepage[0])}
						</CoinLink>
						<CoinLink href={links.repos_url.github[0]}>Source code</CoinLink>
					</LinksContainer>
					<LinksContainer>
						<LinksSectionName>Explorers</LinksSectionName>
						{links.blockchain_site.length > 0 ? (
							links.blockchain_site.map(
								(link, index) =>
									link && (
										<CoinLink key={index} href={link}>
											{removeHttp(link)}
										</CoinLink>
									)
							)
						) : (
							<p>No explorers links available</p>
						)}
					</LinksContainer>
					<LinksContainer>
						<LinksSectionName>Community</LinksSectionName>
						<CoinLink href={links.official_forum_url[0]}>
							{removeHttp(links.official_forum_url[0])}
						</CoinLink>
						<CoinLink href={links.subreddit_url}>Reddit</CoinLink>
					</LinksContainer>
				</LinksList>
			</LinksListWrapper>
		</LinksSectionWrapper>
	);
};

export default LinksSectionMobile;
