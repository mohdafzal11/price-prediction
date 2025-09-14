import React, { useEffect } from 'react';
import {
	InputWrapper,
	TitleWrapper,
	FormWrapper,
	WatchlistModalWrapper,
	FormTitle,
	WatchlistForm,
	Label,
	Input,
	SaveButton,
} from './WatchlistModal.styled';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useCreateWatchlist from 'hooks/useCreateWatchlist';
import useUpdateWatchlist from 'hooks/useUpdateWatchlist';
import { Watchlist } from '@prisma/client';
import { useTheme } from 'styled-components';

const schema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(30, 'Name must have 30 characters maximum'),
	description: z.string().nullable(),
});

export type WatchlistInputs = z.infer<typeof schema>;

interface WatchlistModalProps {
	currentWatchlist: Watchlist;
	handleModalClose: () => void;
	watchlistAction: 'edit' | 'create' | null;
	modalOpen: boolean;
}

const WatchlistModal = ({
	currentWatchlist,
	handleModalClose,
	watchlistAction,
	modalOpen,
}: WatchlistModalProps) => {
	const { register, handleSubmit } = useForm<WatchlistInputs>({
		resolver: zodResolver(schema),
		mode: 'onSubmit',
		reValidateMode: 'onSubmit',
	});
	const createWatchlist = useCreateWatchlist();
	const updateWatchlist = useUpdateWatchlist();
	const {
		colors: { textColor },
	} = useTheme();

	useEffect(() => {
		document.body.style.overflow = `${modalOpen ? 'hidden' : ''}`;
	}, [modalOpen]);

	const onSubmit = async (inputs: WatchlistInputs) => {
		if (watchlistAction === 'create') {
			createWatchlist.mutate(inputs);
		}
		if (watchlistAction === 'edit') {
			updateWatchlist.mutate({
				id: currentWatchlist.id,
				inputs,
			});
		}

		handleModalClose();
	};

	return (
		<WatchlistModalWrapper isOpen={modalOpen}>
			<FormWrapper>
				<TitleWrapper>
					{watchlistAction === 'create' && <FormTitle>New Watchlist</FormTitle>}
					{watchlistAction === 'edit' && <FormTitle>Edit Watchlist</FormTitle>}
					<button onClick={handleModalClose}>
						<FontAwesomeIcon icon={faX} color={textColor} />
					</button>
				</TitleWrapper>
				<WatchlistForm onSubmit={handleSubmit(onSubmit)}>
					<InputWrapper>
						<Label htmlFor="">Watchlist Name</Label>
						<Input
							{...register('name')}
							type="text"
							defaultValue={
								watchlistAction === 'edit' ? currentWatchlist.name : ''
							}
							placeholder="Watchlist Name"
						/>
					</InputWrapper>
					<InputWrapper second>
						<Label htmlFor="">Description (optional)</Label>
						<Input
							{...register('description')}
							textarea
							as="textarea"
							defaultValue={
								watchlistAction === 'edit'
									? currentWatchlist.description || ''
									: ''
							}
							placeholder="Watchlist description"
						/>
					</InputWrapper>
					<SaveButton type="submit">
						{watchlistAction === 'edit' && 'Save Changes'}
						{watchlistAction === 'create' && 'Create Watchlist'}
					</SaveButton>
				</WatchlistForm>
			</FormWrapper>
		</WatchlistModalWrapper>
	);
};

export default WatchlistModal;
