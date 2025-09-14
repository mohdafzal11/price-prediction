export const formatToLongDate = (date: Date) => {
	return new Intl.DateTimeFormat('en-US', {
		dateStyle: 'long',
		timeStyle: 'short',
	}).format(date);
};

export const formatToShortDate = (date: Date) => {
	return new Intl.DateTimeFormat('en-US', {
		dateStyle: 'medium',
	}).format(date);
};
