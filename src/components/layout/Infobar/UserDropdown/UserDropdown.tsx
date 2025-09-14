import React from 'react';
import Link from 'next/link';
import { Button } from 'styled/elements/Button';
import { useAppDispatch } from 'hooks/redux';
import { changeAuthOpen } from 'app/slices/menuSlice';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import ProfileImage from 'components/ProfileImage/ProfileImage';
import {
	UserDropdownWrapper,
	ButtonsWrapper,
	UserMenuWrapper,
	UserMenuDropdown,
	UserMenu,
	UserPreview,
	UserName,
	UserEmail,
	UserMenuItem,
	ImageWrapper,
} from './UserDropdown.styled';
import CustomLink from 'components/CustomLink/CustomLink';

const UserDropdown = () => {
	const dispatch = useAppDispatch();
	const { data: session } = useSession();

	const openSignUp = () => {
		dispatch(changeAuthOpen('signup'));
	};
	const openLogIn = () => {
		dispatch(changeAuthOpen('login'));
	};

	const handleLogOut = () => {
		signOut({
			redirect: false,
		});
	};

	if (!session)
		return (
			<UserDropdownWrapper>
				<ButtonsWrapper>
					<Button outlined onClick={openLogIn}>
						Log in
					</Button>
					<Button onClick={openSignUp}>Sign up</Button>
				</ButtonsWrapper>
			</UserDropdownWrapper>
		);

	const {
		user: { image, name, email, displayName },
	} = session;

	return (
		<UserDropdownWrapper>
			{session && (
				<UserMenuWrapper>
					<ImageWrapper>
						<ProfileImage
							source={image}
							firstLetter={name.charAt(0)}
							width={28}
							height={28}
							variant="small"
						/>
					</ImageWrapper>
					<UserMenuDropdown>
						<UserMenu>
							<CustomLink href={`/community/profile/${name}`}>
								<a>
									<UserPreview>
										<ProfileImage
											source={image}
											firstLetter={name.charAt(0)}
											width={64}
											height={64}
											variant="medium"
										/>
										<div>
											<UserName>Hi, {displayName}</UserName>
											<UserEmail>{email}</UserEmail>
										</div>
									</UserPreview>
								</a>
							</CustomLink>
							<div>
								<CustomLink href="/watchlist">
									<a>
										<UserMenuItem>Watchlist</UserMenuItem>
									</a>
								</CustomLink>
								<CustomLink href={`/community/profile/${name}`}>
									<a>
										<UserMenuItem>My Profile</UserMenuItem>
									</a>
								</CustomLink>
								<CustomLink href="/settings">
									<a>
										<UserMenuItem>Settings</UserMenuItem>
									</a>
								</CustomLink>
								<UserMenuItem as="button" onClick={handleLogOut}>
									Log out
								</UserMenuItem>
							</div>
						</UserMenu>
					</UserMenuDropdown>
				</UserMenuWrapper>
			)}
		</UserDropdownWrapper>
	);
};

export default UserDropdown;
