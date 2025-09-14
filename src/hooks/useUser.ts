import { User } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchUser = (name: string) =>
	axios.get<User>(`/api/user/get?name=${name}`);

const useUser = ({
	name,
	updateUser,
}: {
	name?: string;
	updateUser?: (user: User) => void;
}) => {
	return useQuery({
		queryKey: ['user'],
		queryFn: async () => (await fetchUser(name!)).data,
		refetchOnWindowFocus: false,
		onSuccess: (data) => {
			updateUser && updateUser(data);
		},
		enabled: !!name,
	});
};

export default useUser;
