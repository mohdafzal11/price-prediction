import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { changeAuthOpen } from 'app/slices/menuSlice';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import {
	LoginSignupModal,
	LoginSignupWrapper,
	AuthButtonsWrapper,
	AuthTypeButton,
	CloseButton,
} from './LoginSignup.styled';
import LogInForm from './LoginForm';
import SignupForm from './SignupForm';

export interface AuthFormProps {
	closeFormCallback: () => void;
}

export type AuthFormInputs = {
	email: string;
	password: string;
};

export type SignupFormInputs = {
	email: string;
	password: string;
};

const LoginSignup = () => {
	const { authOpen } = useAppSelector((state) => state.menu);
	const dispatch = useAppDispatch();

	const closeForm = () => {
		dispatch(changeAuthOpen(false));
	};

	const openSignUp = () => {
		dispatch(changeAuthOpen('signup'));
	};

	const openLogIn = () => {
		dispatch(changeAuthOpen('login'));
	};

	return (
		<LoginSignupModal open={authOpen}>
			<LoginSignupWrapper>
				<AuthButtonsWrapper>
					<AuthTypeButton selected={authOpen === 'login'} onClick={openLogIn}>
						Log In
					</AuthTypeButton>
					<AuthTypeButton selected={authOpen === 'signup'} onClick={openSignUp}>
						Sign Up
					</AuthTypeButton>
				</AuthButtonsWrapper>
				{authOpen === 'login' && <LogInForm closeFormCallback={closeForm} />}
				{authOpen === 'signup' && <SignupForm closeFormCallback={closeForm} />}
				<CloseButton onClick={closeForm}>
					<FontAwesomeIcon icon={faX} />
				</CloseButton>
			</LoginSignupWrapper>
		</LoginSignupModal>
	);
};

export default LoginSignup;
