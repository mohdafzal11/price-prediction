import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { UpdateUserBody } from 'pages/api/user/update';
import { toast } from 'react-hot-toast';

const updateUser = (userData: UpdateUserBody) =>
	axios.patch('/api/user/update', {
		...userData,
	});

const useUpdateUser = (refetch: () => void) => {
	return useMutation({
		mutationFn: (userData: UpdateUserBody) => updateUser(userData),
		onSuccess: () => {
			toast('Updated successfully');
			refetch();
		},
	});
};

export default useUpdateUser;
