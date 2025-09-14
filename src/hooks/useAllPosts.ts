import { Like, Post, User } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type PostWithAuthor = Post & {
	author: User;
	likes: Like[];
};

const fetchAllPosts = () => axios.get<PostWithAuthor[]>('/api/post/getAll');

const useAllPosts = () => {
	return useQuery({
		queryKey: ['posts'],
		queryFn: async () => (await fetchAllPosts()).data,
	});
};

export default useAllPosts;
