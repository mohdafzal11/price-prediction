import { Like, Post, User } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/router';

type UserPosts = (Post & {
	author: User;
	likes: Like[];
})[];

const fetchUserLikes = (userName: string) =>
	axios.get<UserPosts>('/api/post/getLiked', {
		params: {
			userName,
		},
	});

const useUserLikes = () => {
	const { query } = useRouter();

	return useQuery({
		queryKey: ['userLikes'],
		queryFn: async () => (await fetchUserLikes(query.name as string)).data,
		enabled: !!query.name && query.type === 'Likes',
	});
};

export default useUserLikes;
