import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';
import { toast } from 'react-hot-toast';
import {
	CropperWrapper,
	Modal,
	ModalWrapper,
	ZoomRange,
	CropButton,
} from './CropImage.styled';
import useUpdateUser from 'hooks/useUpdateUser';
import useUploadImage from 'hooks/useUploadImage';

interface CropImageProps {
	image: string;
	refetch: () => void;
	visible: boolean;
	closeCallback: () => void;
}

const CropImage = ({
	image,
	refetch,
	visible,
	closeCallback,
}: CropImageProps) => {
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
	const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
		setCroppedAreaPixels(croppedAreaPixels);
	}, []);
	const updateUser = useUpdateUser(refetch);
	const uploadToColudinary = useUploadImage({
		onSuccess: ({ secure_url }) => {
			toast('Successfuly set image');
			updateUser.mutate({ image: secure_url });
		},
	});

	const cropImage = async () => {
		if (!image || !croppedAreaPixels) return;
		try {
			const croppedImage = await getCroppedImg(image, croppedAreaPixels);
			if (!croppedImage) return;

			const formData = new FormData();
			formData.append('file', croppedImage);
			formData.append(
				'upload_preset',
				process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
			);

			uploadToColudinary.mutate(formData);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<ModalWrapper visible={visible}>
			<Modal>
				<button type="button" onClick={closeCallback}>
					Close
				</button>
				<CropperWrapper>
					<Cropper
						image={image}
						crop={crop}
						zoom={zoom}
						aspect={1 / 1}
						onCropChange={setCrop}
						onCropComplete={onCropComplete}
						onZoomChange={setZoom}
					/>
				</CropperWrapper>
				<div>
					<ZoomRange
						type="range"
						value={zoom}
						min={1}
						max={3}
						step={0.1}
						aria-labelledby="Zoom"
						onChange={(e) => {
							setZoom(+e.target.value);
						}}
					/>
				</div>
				<CropButton type="button" onClick={cropImage}>
					Crop
				</CropButton>
				<button type="button" onClick={closeCallback}>
					Cancel
				</button>
			</Modal>
		</ModalWrapper>
	);
};
export default CropImage;

const createImage = (url: string) =>
	new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		image.src = url;
		image.addEventListener('load', () => resolve(image));
		image.addEventListener('error', (error) => reject(error));
	});

async function getCroppedImg(
	imageSrc: string,
	pixelCrop: Area
): Promise<Blob | null> {
	const image = await createImage(imageSrc);
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		return null;
	}

	// set canvas size to match the bounding box
	canvas.width = image.width;
	canvas.height = image.height;

	// draw image
	ctx.drawImage(image, 0, 0);

	// croppedAreaPixels values are bounding box relative
	// extract the cropped image using these values
	const data = ctx.getImageData(
		pixelCrop.x,
		pixelCrop.y,
		pixelCrop.width,
		pixelCrop.height
	);

	// set canvas width to final desired crop size - this will clear existing context
	canvas.width = pixelCrop.width;
	canvas.height = pixelCrop.height;

	// paste generated image at the top left corner
	ctx.putImageData(data, 0, 0);

	// As Base64 string
	// return canvas.toDataURL('image/jpeg');

	// As Blob
	return new Promise((resolve, reject) => {
		canvas.toBlob((file) => {
			if (!file) {
				reject("Couldn't create blob");
				return null;
			}
			resolve(file);
		}, 'image/jpeg');
	});
}
