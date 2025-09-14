import React from 'react';
import Post from '../Post/Post';
import Link from 'next/link';
import {
	ActivitiesWrapper,
	ActivityItem,
	NoMoreContent,
	PostsContainer,
} from './ProfilePosts.styled';
import { useRouter } from 'next/router';
import useUserPosts from 'hooks/useUserPosts';
import useUserComments from 'hooks/useUserComments';
import useUserLikes from 'hooks/useUserLikes';

const ProfilePosts = () => {
	const { query } = useRouter();
	const { data: posts, refetch: refetchPosts } = useUserPosts();
	const { data: comments, refetch: refetchComments } = useUserComments();
	const { data: likes, refetch: refetchLikes } = useUserLikes();

	const isSelected = (type?: string) => query.type === type;

	return (
		<div>
			<div>
				<ActivitiesWrapper>
					<Link href={`/community/profile/${query.name}/?type=Posts`}>
						<ActivityItem
							selected={isSelected('Posts') || isSelected(undefined)}
						>
							Posts
						</ActivityItem>
					</Link>
					<Link href={`/community/profile/${query.name}/?type=Comments`}>
						<ActivityItem selected={isSelected('Comments')}>
							Comments
						</ActivityItem>
					</Link>
					<Link href={`/community/profile/${query.name}/?type=Likes`}>
						<ActivityItem selected={isSelected('Likes')}>Likes</ActivityItem>
					</Link>
				</ActivitiesWrapper>
			</div>
			<PostsContainer>
				{(query.type === 'Posts' || query.type === undefined) && posts && (
					<>
						{posts.map((post) => (
							<Post
								key={post.id}
								{...post}
								image={post.author.image}
								name={post.author.name}
								displayName={post.author.displayName}
								refetchCallback={refetchPosts}
							/>
						))}
					</>
				)}
				{query.type === 'Comments' && comments && (
					<>
						{comments.map((post) => (
							<div key={post.id}>
								<Post
									{...post.replyTo}
									image={post.replyTo.author.image}
									name={post.replyTo.author.name}
									displayName={post.replyTo.author.displayName}
									commented
									refetchCallback={refetchComments}
								/>
								<Post
									{...post}
									image={post.author.image}
									name={post.author.name}
									displayName={post.author.displayName}
									noMarginTop
									isComment
									refetchCallback={refetchComments}
								/>
							</div>
						))}
					</>
				)}
				{query.type === 'Likes' && likes && (
					<>
						{likes.map((post) => {
							if (post.author !== null) {
								return (
									<Post
										key={post.id}
										{...post}
										image={post.author.image}
										name={post.author.name}
										displayName={post.author.name}
										refetchCallback={refetchLikes}
									/>
								);
							}
						})}
					</>
				)}
				<NoMoreContent>No more {query.type ?? 'Posts'}</NoMoreContent>
			</PostsContainer>
		</div>
	);
};

export default ProfilePosts;
