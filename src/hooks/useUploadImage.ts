import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const uploadImage = (data: FormData) =>
	axios.post<{ secure_url: string }>(
		process.env.NEXT_PUBLIC_CLOUDINARY_URL!,
		data
	);

const useUploadImage = ({
	onSuccess,
}: {
	onSuccess: (data: { secure_url: string }) => void;
}) => {
	return useMutation({
		mutationFn: async (data: FormData) => (await uploadImage(data)).data,
		onSuccess,
	});
};

export default useUploadImage;
