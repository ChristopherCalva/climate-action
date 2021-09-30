import React, { useContext, useEffect, useState } from 'react'
import { Redirect, useHistory } from 'react-router-dom'
import { AuthContext } from '../userContext'
import { useQuery, useMutation, gql } from '@apollo/client'

const GET_POSTS_BY_USER = gql`
	query getPostsByUserIdQuery($getPostsByUserIdUserId: String!) {
		getPostsByUserId(userId: $getPostsByUserIdUserId) {
			_id
			title
			description
			upvotes
			downvotes
			comments {
				_id
				description
				creatorUsername
			}
			creatorUsername
		}
	}
`
const VOTE_ON_POST = gql`
	mutation voteOnPostMutation(
		$voteOnPostVoteType: Boolean!
		$voteOnPostPostId: String!
		$voteOnPostCreatorId: String!
	) {
		voteOnPost(
			voteType: $voteOnPostVoteType
			postId: $voteOnPostPostId
			creatorId: $voteOnPostCreatorId
		) {
			creatorId
			voteType
			postId
		}
	}
`

const CREATE_COMMENT = gql`
	mutation createCommentMutation(
		$createCommentDescription: String!
		$createCommentPostId: String!
		$createCommentCreatorUsername: String!
		$createCommentCreatorId: String!
	) {
		createComment(
			description: $createCommentDescription
			postId: $createCommentPostId
			creatorUsername: $createCommentCreatorUsername
			creatorId: $createCommentCreatorId
		) {
			postId
			creatorId
		}
	}
`

function MyPosts() {
	const { user, setUser } = useContext(AuthContext)
	const { loading, error, data } = useQuery(GET_POSTS_BY_USER, {
		variables: {
			getPostsByUserIdUserId: user._id,
		},
	})
	const [vote, { data: voteData, loading: voteLoading, error: votePostError }] =
		useMutation(VOTE_ON_POST, {
			refetchQueries: [GET_POSTS_BY_USER, 'getAllPostsQuery'],
		})
	const [
		createNewComment,
		{
			data: newCommentData,
			loading: newCommentLoading,
			error: newCommentError,
		},
	] = useMutation(CREATE_COMMENT, {
		refetchQueries: [GET_POSTS_BY_USER, 'getAllPostsQuery'],
	})
	const [allPosts, setAllPosts] = useState([])
	const [redirect, setRedirect] = useState(false)
	let history = useHistory()

	useEffect(() => {
		if (loading) {
			return <div>Loading...</div>
		}
		if (error) {
			console.error(error)
			return <div>Error! No posts to load!</div>
		}
		setAllPosts(data.getPostsByUserId)
	})
	if (user.token === '') {
		return <Redirect to="/login"></Redirect>
	}

	async function voteOnPost(e) {
		e.preventDefault()
		// true means upvote, false means downvote
		let buttonValue = e.target.getAttribute('data-key')
		let postId = e.target.parentNode.getAttribute('data-key')
		let voteOption = true

		if (buttonValue === 'false') {
			voteOption = false
		}

		let newVote = await vote({
			variables: {
				voteOnPostVoteType: voteOption,
				voteOnPostPostId: postId,
				voteOnPostCreatorId: user._id,
			},
		})

		if (!newVote.data.postId) {
			// give error message
		}
	}

	async function createComment(e) {
		e.preventDefault()
		let postId = e.target.parentNode.getAttribute('data-key')
		let commentDescription = e.target[0].value
		await createNewComment({
			variables: {
				createCommentDescription: commentDescription,
				createCommentPostId: postId,
				createCommentCreatorUsername: user.username,
				createCommentCreatorId: user._id,
			},
		})
		e.target[0].value = ''
	}

	return (
		<div className="MyPosts">
			<h1>My Posts</h1>
			{redirect ? <Redirect push to="/posts"></Redirect> : null}

			<button
				onClick={() => {
					setRedirect(true)
				}}
			>
				Go back
			</button>
			{allPosts.map(
				({
					_id,
					title,
					description,
					upvotes,
					downvotes,
					comments,
					creatorUsername,
				}) => (
					<div key={_id} data-key={_id}>
						<h2>{title}</h2>
						<p>{description}</p>
						<p>Created by: {creatorUsername}</p>
						<button data-key={true} onClick={voteOnPost}>
							Upvote: {upvotes}
						</button>
						<button data-key={false} onClick={voteOnPost}>
							Downvote: {downvotes}
						</button>
						<form onSubmit={createComment}>
							<input type="text" id="comment" name={_id} />
							<input type="submit" value="Comment" />
						</form>

						<h3>Comments</h3>
						{comments.map(
							({
								_id: commentId,
								description: commentDesc,
								creatorUsername: commentCreator,
							}) => (
								<p key={commentId}>
									<strong>{creatorUsername}</strong>: {commentDesc}
								</p>
							)
						)}
					</div>
				)
			)}
		</div>
	)
}

export default MyPosts
