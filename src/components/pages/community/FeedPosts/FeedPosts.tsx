import React from 'react';
import Post from '../Post/Post';
import { Search, SearchButton, SearchContainer } from './FeedPosts.styled';
import useAllPosts from 'hooks/useAllPosts';

const FeedPosts = () => {
	const { data: posts, refetch } = useAllPosts();

	return (
		<div>
			<SearchContainer>
				<Search type="text" placeholder="Search posts or users..." />
				<SearchButton>Search</SearchButton>
			</SearchContainer>
			{posts && (
				<div>
					{posts.map((post) => (
						<Post
							key={post.id}
							{...post}
							image={post.author.image}
							name={post.author.name}
							displayName={post.author.name}
							marginInline
							refetchCallback={refetch}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default FeedPosts;
