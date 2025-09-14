import React from 'react';
import styled from 'styled-components';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faCog } from '@fortawesome/free-solid-svg-icons';
import CustomLink from 'components/CustomLink/CustomLink';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const DropdownContainer = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: ${props => (props.isOpen ? 'block' : 'none')};
  z-index: 1000;
  min-width: 200px;
  margin-top: 8px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MenuItem = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: ${props => props.theme.colors.text};
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.colors.hover};
  }

  svg {
    width: 16px;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.border};
  margin: 4px 0;
`;

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ isOpen, onClose }) => {
  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <DropdownContainer isOpen={isOpen}>
      <CustomLink href="/user/profile" passHref>
        <MenuItem onClick={onClose}>
          <FontAwesomeIcon icon={faUser} />
          Profile
        </MenuItem>
      </CustomLink>
      <CustomLink href="/user/settings" passHref>
        <MenuItem onClick={onClose}>
          <FontAwesomeIcon icon={faCog} />
          Settings
        </MenuItem>
      </CustomLink>
      <Divider />
      <MenuItem onClick={handleSignOut}>
        <FontAwesomeIcon icon={faSignOutAlt} />
        Sign Out
      </MenuItem>
    </DropdownContainer>
  );
};

export default ProfileDropdown;
