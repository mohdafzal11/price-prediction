import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { CreatePostBody } from 'components/pages/community/CreatePostForm/CreatePostForm';

const createPost = (body: CreatePostBody) =>
	axios.post('/api/post/create', {
		...body,
	});

const useCreatePost = (onSuccess: () => void) => {
	return useMutation({
		mutationFn: async (body: CreatePostBody) => await createPost(body),
		onSuccess,
	});
};

export default useCreatePost;
