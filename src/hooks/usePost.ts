import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/router';
import { PostDetails } from 'pages/api/post/get';

const fetchPost = (id: string) =>
	axios.get<PostDetails>('/api/post/get', {
		params: {
			id,
		},
	});

const usePost = () => {
	const { query } = useRouter();

	return useQuery({
		queryKey: ['postDetails'],
		queryFn: async () => (await fetchPost(query.id as string)).data,
		enabled: !!query.id,
	});
};

export default usePost;
