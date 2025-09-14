import Image from 'next/image';
import Link from 'next/link';
import * as S from './Header.styled';
import { useThemeContext } from 'src/theme/ThemeProvider';
import { useTheme } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-regular-svg-icons';
import { faBars, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { toggleOpen, changeAuthOpen } from 'app/slices/menuSlice';
import { useSession, signOut } from 'next-auth/react';
import { authConfig } from 'utils/auth';
import getConfig from 'next/config';
import { getHostPageUrl, getPageUrl } from 'utils/config';
import ProfileDropdown from './ProfileDropdown';
import { useState, useRef, useEffect } from 'react';
import CloudinaryImage from '../OptimizedImage/CloudinaryImage';
import CustomLink from 'components/CustomLink/CustomLink';

const { publicRuntimeConfig } = getConfig();

const Header = () => {
  const [, dispatch] = useThemeContext();
  const { name } = useTheme();
  const dispatchMenu = useAppDispatch();
  const { data: session } = useSession();
  const { authOpen } = useAppSelector((state) => state.menu);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggleTheme = () => {
    dispatch('toggle');
  };

  const handleToggleMenu = () => {
    dispatchMenu(toggleOpen());
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuthClick = () => {
    if (!session) {
      dispatchMenu(changeAuthOpen(authOpen ? false : 'login'));
    } else {
      setDropdownOpen(!dropdownOpen);
    }
  };

  const handleSignOut = async () => {
    await signOut({ ...authConfig, redirect: false });
  };

  return (
    <S.HeaderContainer>
      <S.HeaderContent>
        <S.HeaderActions>
          <S.ThemeButtonContainer>
            <S.ThemeToggleSwitch>
              <span className="sr-only">Toggle dark/light theme</span>
              <S.ThemeToggleInput 
                type="checkbox" 
                checked={name === 'dark'}
                onChange={handleToggleTheme}
                aria-label="Toggle dark/light theme"
              />
              <S.ThemeToggleSlider />
            </S.ThemeToggleSwitch>
          </S.ThemeButtonContainer>
        </S.HeaderActions>
        <S.LogoContainer>
          <CustomLink href={getHostPageUrl("/")} aria-label="DroomDroom Logo">
            {/* Use Cloudinary for optimized logo delivery with automatic format and quality */}
            <CloudinaryImage
              theme={name}
              alt="DroomDroom Logo"
              width={248}
              height={35}
              isLCP={true}
              priority
            />
          </CustomLink>
        </S.LogoContainer>
        <S.RightContainer>
          {/* <div ref={dropdownRef} style={{ position: 'relative' }}>
            <S.AuthButton onClick={handleAuthClick}>
              <FontAwesomeIcon icon={faUser} />
              {session ? session.user?.displayName || session.user?.email?.split('@')[0] || 'Profile' : 'Sign In'}
            </S.AuthButton>
            {session && (
              <ProfileDropdown isOpen={dropdownOpen} onClose={() => setDropdownOpen(false)} />
            )}
          </div> */}
        </S.RightContainer>
      </S.HeaderContent>
    </S.HeaderContainer>
  );
};

export default Header;
