import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useRouter } from 'next/router';
import { BackHistoryWrapper, Text } from './BackHistory.styled';

interface BackHistoryProps {
	text: string;
}

const BackHistory = ({ text }: BackHistoryProps) => {
	const { back } = useRouter();

	return (
		<BackHistoryWrapper>
			<button onClick={back}>
				<FontAwesomeIcon fontSize={24} icon={faArrowLeft} />
			</button>
			<Text>{text}</Text>
		</BackHistoryWrapper>
	);
};

export default BackHistory;
