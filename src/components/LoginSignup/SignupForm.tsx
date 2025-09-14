import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import Loader from 'styled/elements/Loader';
import { SignupFormInputs, AuthFormProps } from './LoginSignup';
import axios from 'axios';
import {
	InputWrapper,
	Label,
	Input,
	Error,
	Submit,
} from './LoginSignup.styled';
import { getApiUrl } from 'utils/config';
import { signIn } from 'next-auth/react';
import { authConfig } from 'utils/auth';

const SignupForm = ({ closeFormCallback }: AuthFormProps) => {
	const schema = z.object({
		email: z.string().email({ message: 'Invalid email address' }),
		password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
	});
	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		clearErrors,
		reset,
	} = useForm<SignupFormInputs>({
		resolver: zodResolver(schema),
		mode: 'onSubmit',
		reValidateMode: 'onSubmit',
	});
	const [loading, setLoading] = useState<boolean>(false);
	const { email, password } = watch();

	useEffect(() => {
		clearErrors('email');
	}, [email]);

	useEffect(() => {
		clearErrors('password');
	}, [password]);

	const onSignUp = async (data: SignupFormInputs) => {
		setLoading(true);
		try {
			// await axios.post('/api/auth/signup', data);
			let api_endpoint = getApiUrl("/auth/signup");
			await axios.post(api_endpoint, data);
			
			// Sign in the user immediately after successful signup
			const result = await signIn('credentials', {
				...authConfig,
				email: data.email,
				password: data.password,
				redirect: false,
			});

			if (result?.error) {
				throw new Error('Failed to sign in after registration');
			}

			closeFormCallback();
			reset();
			toast.success('Account created successfully');
		} catch (error: any) {
			console.error('Registration error:', error);
			if (error.response?.data?.message === 'User already exists') {
				toast.error('An account with this email already exists');
			} else {
				toast.error('Error occurred during registration');
			}
		}
		setLoading(false);
	};

	return (
		<form onSubmit={handleSubmit(onSignUp)}>
			<InputWrapper>
				<Label htmlFor="register-email">Email Address</Label>
				<Input
					type="email"
					id="register-email"
					placeholder="Enter your email address..."
					{...register('email')}
					error={errors['email'] ? true : false}
					autoComplete="off"
				/>
				{errors.email?.message && <Error>{errors.email?.message}</Error>}
			</InputWrapper>
			<InputWrapper>
				<Label htmlFor="register-password">Password</Label>
				<Input
					type="password"
					id="register-password"
					placeholder="Enter your password..."
					{...register('password')}
					error={errors['password'] ? true : false}
				/>
				{errors.password?.message && <Error>{errors.password?.message}</Error>}
			</InputWrapper>
			<Submit disabled={loading || !email || !password}>
				{loading ? <Loader /> : 'Sign Up'}
			</Submit>
		</form>
	);
};

export default SignupForm;
