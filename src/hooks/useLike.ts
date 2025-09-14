import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const like = (postId: string) =>
	axios.post('/api/like/create', {
		postId,
	});

const useLike = (onSuccess: () => void) => {
	return useMutation({
		mutationFn: async (postId: string) => (await like(postId)).data,
		onSuccess,
	});
};

export default useLike;
