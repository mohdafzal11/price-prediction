import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const unlike = (postId: string) =>
	axios.delete('/api/like/remove', {
		params: {
			postId,
		},
	});

const useUnlike = (onSuccess: () => void) => {
	return useMutation({
		mutationFn: async (postId: string) => (await unlike(postId)).data,
		onSuccess,
	});
};

export default useUnlike;
