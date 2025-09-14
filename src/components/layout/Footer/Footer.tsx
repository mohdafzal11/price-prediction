import React, { useState, useEffect, startTransition } from 'react';
import Image from 'next/image';
import * as S from './Footer.styled';
import { getPageUrl, getHostPageUrl } from 'utils/config';
import { useTheme } from 'styled-components';
import CurrencySelector from 'components/CurrencySelector/CurrencySelector';
import imageLoader from 'src/utils/imageLoader';
import CustomLink from 'components/CustomLink/CustomLink';

// TypeScript interfaces for footer API data
interface SocialLink {
  text: string;
  url: string;
  iconUrl: string;
  color: string;
}

interface FooterLink {
  text: string;
  url: string;
}

interface FooterData {
  socials: SocialLink[];
  company: FooterLink[];
  'quick-links': FooterLink[];
}

const Footer = () => {
  const { name } = useTheme();
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const handleExternalRedirect = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    window.location.href = url;
  };

  useEffect(() => {
    // Set client flag to prevent hydration mismatch
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const fetchFooterData = async () => {
      try {
        const response = await fetch('https://droomdroom.com/api/v1/footer-menu');
        if (response.ok) {
          const data: FooterData = await response.json();
          startTransition(() => {
            setFooterData(data);
          });
        } else {
          console.error('Failed to fetch footer data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching footer data:', error);
      } finally {
        startTransition(() => {
          setLoading(false);
        });
      }
    };

    fetchFooterData();
  }, [isClient]);

  // Fallback data in case API fails
  const fallbackData: FooterData = {
    socials: [
      { text: 'Twitter', url: 'https://twitter.com/droomdroom', iconUrl: 'https://api.iconify.design/fa-brands:x-twitter.svg?color=%23000000&height=20', color: '#000000' },
      { text: 'Facebook', url: 'https://www.facebook.com/0xDroomDroom/', iconUrl: 'https://api.iconify.design/fa-brands:facebook.svg?color=%231877F2&height=20', color: '#1877F2' },
      { text: 'YouTube', url: 'https://www.youtube.com/@droomdroom', iconUrl: 'https://api.iconify.design/fa-brands:youtube.svg?color=%23FF0000&height=20', color: '#FF0000' },
      { text: 'Telegram', url: 'https://t.me/droomdroom', iconUrl: 'https://api.iconify.design/fa-brands:telegram.svg?color=%2326A5E4&height=20', color: '#26A5E4' },
      { text: 'LinkedIn', url: 'https://www.linkedin.com/company/droomdroom/', iconUrl: 'https://api.iconify.design/fa-brands:linkedin.svg?color=%230A66C2&height=20', color: '#0A66C2' },
      { text: 'Instagram', url: 'https://www.instagram.com/0xdroomdroom/', iconUrl: 'https://api.iconify.design/fa-brands:instagram.svg?color=%23E4405F&height=20', color: '#E4405F' },
      { text: 'RSS', url: 'https://droomdroom.com/feed/', iconUrl: 'https://api.iconify.design/material-symbols:rss-feed-rounded.svg?color=%23EE802F&height=20', color: '#EE802F' }
    ],
    company: [
      { text: 'About', url: '/about' },
      { text: 'Careers', url: '/careers' },
      { text: 'Partner', url: '/partner' },
      { text: 'Privacy Policy', url: '/privacy-policy' },
      { text: 'Terms of Service', url: '/terms' },
      { text: 'Contact Us', url: '/contact' }
    ],
    'quick-links': [
      { text: 'Home', url: 'https://droomdroom.com' },
      { text: 'Price', url: '/price' },
      { text: 'Converter', url: '/converter' },
      { text: 'Top List', url: '/top-list' },
      { text: 'Learn', url: '/learn' },
      { text: 'Press Release', url: '/press-release' },
      { text: 'Web Stories', url: '/web-stories' }
    ]
  };

  const currentFooterData = footerData || fallbackData;

  return (
    <S.FooterWrapper>
      <S.SocialsSection>
        <S.SocialsContainer>
          <S.SocialsContent>
            <S.SocialsTitle>Follow Us on Socials</S.SocialsTitle>
            <S.SocialsDescription>
              We use social media to react to breaking news, update supporters and share information.
            </S.SocialsDescription>
          </S.SocialsContent>
          <S.SocialIcons>
            {currentFooterData.socials.map((social, index) => {
              // Special handling for Google News which needs different styling
              const isGoogleNews = social.text === 'Google News';
              
              return (
                <S.SocialIconLink 
                  key={index}
                  href={social.url} 
                  target="_blank" 
                  rel="nofollow" 
                  $bgColor={isGoogleNews ? 'transparent' : social.color}
                  aria-label={social.text}
                  style={isGoogleNews ? { border: '1px solid #ddd' } : {}}
                >
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    filter: isGoogleNews ? 'none' : 'brightness(0) invert(1)' // Make SVGs white except Google News
                  }}>
                    <Image
                      src={social.iconUrl}
                      alt={social.text}
                      width={20}
                      height={20}
                      loader={imageLoader}
                    />
                  </div>
                </S.SocialIconLink>
              );
            })}
          </S.SocialIcons>
        </S.SocialsContainer>
      </S.SocialsSection>

      <S.Divider />

      <S.FooterContent>
        <S.BrandSection>
          <S.LogoContainer>
            <Image
              src={`${getPageUrl("")}/DroomDroom_${name === 'light' ? 'Black' : 'White'}.webp`}
              alt="DroomDroom Logo"
              width={200}
              height={30}
              priority
              sizes="200px"
              loader={imageLoader}
            />
          </S.LogoContainer>
          <S.Description>
            DroomDroom dedicates thousands of hours of research into the web3 industry to deliver you free, world-class, and accurate content.
          </S.Description>
          <CurrencySelector />
        </S.BrandSection>

        <S.LinksSection>
          <S.Title>Company</S.Title>
          <S.ButtonsGrid>
            {currentFooterData.company.map((link, index) => {
              const href = link.url.startsWith('http') ? link.url : getHostPageUrl(link.url);
              return (
                <CustomLink key={index} href={href} legacyBehavior>
                  <S.ButtonLink>{link.text}</S.ButtonLink>
                </CustomLink>
              );
            })}
          </S.ButtonsGrid>
        </S.LinksSection>

        <S.LinksSection>
          <S.Title>Quick Links</S.Title>
          <S.ButtonsGrid>
            {currentFooterData['quick-links'].map((link, index) => {
              const href = link.url.startsWith('http') ? link.url : getHostPageUrl(link.url);
              return (
                <CustomLink key={index} href={href} legacyBehavior>
                  <S.ButtonLink>{link.text}</S.ButtonLink>
                </CustomLink>
              );
            })}
          </S.ButtonsGrid>
        </S.LinksSection>
      </S.FooterContent>

      <S.Copyright>Copyright © 2025 DroomDroom Corporation. All Rights Reserved</S.Copyright>
    </S.FooterWrapper>
  );
};

export default Footer;