import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Comment } from 'pages/api/post/getUserComments';

const fetchUserComments = (userName: string) =>
	axios.get<Comment[]>('/api/post/getUserComments', {
		params: {
			userName,
		},
	});

const useUserComments = () => {
	const { query } = useRouter();

	return useQuery({
		queryKey: ['userComments'],
		queryFn: async () => (await fetchUserComments(query.name as string)).data,
		enabled: !!query.name && query.type === 'Comments',
		refetchOnWindowFocus: false,
	});
};

export default useUserComments;
