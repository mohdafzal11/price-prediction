import React, { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { authConfig } from 'utils/auth';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import Loader from 'styled/elements/Loader';
import { AuthFormInputs, AuthFormProps } from './LoginSignup';
import {
	InputWrapper,
	Label,
	Input,
	Error,
	Submit,
} from './LoginSignup.styled';

const LogInForm = ({ closeFormCallback }: AuthFormProps) => {
	const schema = z.object({
		email: z.string().email({ message: 'Invalid email.' }),
		password: z.string().min(1, { message: 'Password is required.' }),
	});
	const {
		register,
		handleSubmit,
		formState: { errors },
		clearErrors,
		watch,
		reset,
	} = useForm<AuthFormInputs>({
		resolver: zodResolver(schema),
		mode: 'onSubmit',
		reValidateMode: 'onSubmit',
	});
	const [loading, setLoading] = useState<boolean>(false);
	const [invalidCredentials, setInvalidCredentials] = useState<boolean>(false);
	const { email, password } = watch();

	useEffect(() => {
		clearErrors('email');
		invalidCredentials && setInvalidCredentials(false);
	}, [email]);

	useEffect(() => {
		clearErrors('password');
		invalidCredentials && setInvalidCredentials(false);
	}, [password]);

	const onLogIn = async (data: AuthFormInputs) => {
		setLoading(true);
		try {
			const res = await signIn('credentials', {
				...authConfig,
				email: data.email,
				password: data.password,
				redirect: false,
			});

			if (res?.error) {
				if (res.status === 401) {
					setInvalidCredentials(true);
				} else {
					toast.error('Error occurred during login');
				}
				return;
			}

			closeFormCallback();
			toast.success('Logged in successfully');
			reset();
		} catch (error) {
			console.error('Login error:', error);
			toast.error('An unexpected error occurred');
		}

		setLoading(false);
	};

	return (
		<form onSubmit={handleSubmit(onLogIn)}>
			<InputWrapper>
				<Label htmlFor="login-email">Email Address</Label>
				<Input
					type="email"
					id="login-email"
					placeholder="Enter your email address..."
					{...register('email')}
					error={(errors['email'] ? true : false) || invalidCredentials}
					autoComplete="off"
				/>
				{errors.email?.message && <Error>{errors.email?.message}</Error>}
			</InputWrapper>
			<InputWrapper>
				<Label htmlFor="login-password">Password</Label>
				<Input
					type="password"
					id="login-password"
					placeholder="Enter your password..."
					{...register('password')}
					error={(errors['password'] ? true : false) || invalidCredentials}
				/>
				{errors.password?.message && <Error>{errors.password?.message}</Error>}
				{invalidCredentials && (
					<Error>
						Your email and password does not match. Please try again.
					</Error>
				)}
			</InputWrapper>
			<Submit disabled={loading || !email || !password}>
				{loading ? <Loader /> : 'Log In'}
			</Submit>
		</form>
	);
};
export default LogInForm;
