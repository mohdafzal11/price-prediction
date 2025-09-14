import React, { ChangeEvent, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import CropImage from '../CropImage/CropImage';
import ProfileImage from 'components/ProfileImage/ProfileImage';
import {
	AvatarButton,
	AvatarWrapper,
	Input,
	InputWrapper,
	Label,
	SaveButton,
} from './EditProfileForm.styled';
import { User } from '@prisma/client';
import Loader from 'styled/elements/Loader';
import useUser from 'hooks/useUser';
import useUpdateUser from 'hooks/useUpdateUser';
import { useSession } from 'next-auth/react';

const editUserSchema = z.object({
	displayName: z.string().max(20),
	name: z.string().max(20),
	biography: z.string().max(160).nullable(),
	birthday: z.string().nullable(),
	website: z.string().max(100).nullable(),
});

export type EditUserInputs = z.infer<typeof editUserSchema>;

const EditProfileForm = () => {
	const { data: session } = useSession({ required: true });
	const { register, handleSubmit, setValue, watch } = useForm<EditUserInputs>({
		resolver: zodResolver(editUserSchema),
		mode: 'onSubmit',
	});
	const [cropperOpen, setCropperOpen] = useState<boolean>(false);
	const [imageToCrop, setImageToCrop] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const {
		data: user,
		isLoading,
		isError,
		refetch,
	} = useUser({ name: session?.user.name, updateUser: updateValues });
	const saveChanges = useUpdateUser(refetch);

	function updateValues(user: User) {
		const { name, biography, birthday, displayName, website } = user;

		setValue('name', name);
		setValue('displayName', displayName);
		setValue('biography', biography ?? '');
		setValue(
			'birthday',
			birthday ? (birthday as unknown as string).substring(0, 10) : ''
		);
		setValue('website', website ?? '');
	}

	const openFileWindow = () => {
		fileInputRef.current?.click();
	};

	const changeImageToCrop = (event: ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files) return;
		const imageURL = URL.createObjectURL(event.target.files[0]);
		setImageToCrop(imageURL);
		setCropperOpen(true);
	};

	const handleCloseCropper = () => {
		setCropperOpen(false);
	};

	const updateUser = async (inputs: EditUserInputs) => {
		saveChanges.mutate(inputs);
	};

	if (isLoading) return <div></div>;

	if (isError) return <div></div>;

	const isNotDirty = () => {
		const { biography, birthday, displayName, name, website } = watch();

		return (
			name === (user.name ?? '') &&
			displayName === (user.displayName ?? '') &&
			biography === (user.biography ?? '') &&
			birthday === (user.birthday ?? '') &&
			website === (user.website ?? '')
		);
	};

	return (
		<form onSubmit={handleSubmit(updateUser)}>
			<InputWrapper>
				<Label as="p">Your Avatar</Label>
				<AvatarWrapper>
					<ProfileImage
						source={user.image}
						firstLetter={user.name.charAt(0)}
						width={64}
						height={64}
						variant="medium"
					/>
					<Input
						type="file"
						accept="image/png, image/jpg, image/jpeg"
						ref={fileInputRef}
						onChange={changeImageToCrop}
					/>
					<AvatarButton type="button" onClick={openFileWindow}>
						Edit Avatar
					</AvatarButton>
				</AvatarWrapper>
			</InputWrapper>
			<InputWrapper>
				<Label htmlFor="displayName">Display Name</Label>
				<Input type="text" id="displayName" {...register('displayName')} />
			</InputWrapper>
			<InputWrapper>
				<Label htmlFor="userName">UserName</Label>
				<Input type="text" id="userName" {...register('name')} />
			</InputWrapper>
			<InputWrapper>
				<Label htmlFor="biography">Biography</Label>
				<Input
					textarea
					as="textarea"
					id="biography"
					{...register('biography')}
				/>
			</InputWrapper>
			<InputWrapper>
				<Label htmlFor="birthday">Birthday</Label>
				<Input type="date" id="birthday" {...register('birthday')} />
			</InputWrapper>
			<InputWrapper>
				<Label htmlFor="website">Website</Label>
				<Input type="url" id="website" {...register('website')} />
			</InputWrapper>
			<SaveButton
				disabled={saveChanges.isLoading || isNotDirty()}
				type="submit"
			>
				{saveChanges.isLoading ? <Loader /> : 'Save'}
			</SaveButton>
			{imageToCrop && (
				<CropImage
					image={imageToCrop}
					refetch={refetch}
					visible={cropperOpen}
					closeCallback={handleCloseCropper}
				/>
			)}
		</form>
	);
};

export default EditProfileForm;
