import { Like, Post, User } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/router';

type UserPosts = (Post & {
	author: User;
	likes: Like[];
})[];

const fetchUserPosts = (userName: string) =>
	axios.get<UserPosts>('/api/post/getUserPosts', {
		params: {
			userName,
		},
	});

const useUserPosts = () => {
	const { query } = useRouter();

	return useQuery({
		queryKey: ['userPosts'],
		queryFn: async () => (await fetchUserPosts(query.name as string)).data,
		enabled:
			!!query.name && (query.type === 'Posts' || query.type === undefined),
		refetchOnWindowFocus: false,
	});
};

export default useUserPosts;
