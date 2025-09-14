export const startsWithHttp = (url: string) => {
	return url.startsWith('http');
};

export const removeHttp = (url: string): string => {
	return url.replace(/^https?:\/\/(www.)?|\/?/g, '');
};
