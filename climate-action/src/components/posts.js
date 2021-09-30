import React, { useContext, useEffect, useState } from 'react'
import { Redirect, useHistory } from 'react-router-dom'
import { AuthContext } from '../userContext'
import { useQuery, useMutation, gql } from '@apollo/client'

const GET_POSTS = gql`
	query getAllPostsQuery {
		getAllPosts {
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
			showComments
			creatorUsername
		}
	}
`
const CREATE_POST = gql`
	mutation createPostMutation(
		$createPostTitle: String!
		$createPostDescription: String!
		$createPostCreatorId: String!
		$createPostCreatorUsername: String!
	) {
		createPost(
			title: $createPostTitle
			description: $createPostDescription
			creatorUsername: $createPostCreatorUsername
			creatorId: $createPostCreatorId
		) {
			title
			description
			upvotes
			downvotes
			creatorUsername
			creatorId
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
function Posts() {
	const { user, setUser } = useContext(AuthContext)
	const { loading, error, data } = useQuery(GET_POSTS)
	const [
		createNewPost,
		{
			data: createPostData,
			loading: createPostLoading,
			error: createPostError,
		},
	] = useMutation(CREATE_POST, {
		refetchQueries: [GET_POSTS, 'getAllPostsQuery'],
	})
	const [vote, { data: voteData, loading: voteLoading, error: votePostError }] =
		useMutation(VOTE_ON_POST, {
			refetchQueries: [GET_POSTS, 'getAllPostsQuery'],
		})
	const [
		createNewComment,
		{
			data: newCommentData,
			loading: newCommentLoading,
			error: newCommentError,
		},
	] = useMutation(CREATE_COMMENT, {
		refetchQueries: [GET_POSTS, 'getAllPostsQuery'],
	})
	const [allPosts, setAllPosts] = useState([])
	const [addPostButtonText, setAddPostButtonText] = useState('Add post')
	const [showAddPostForm, setShowAddPostForm] = useState(false)
	const [titleInput, setTitleInput] = useState('')
	const [descriptionInput, setDescriptionInput] = useState('')
	const [createPostMessage, setCreatePostMessage] = useState('')
	const [orderButton, setOrderButton] = useState('Descending')
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
		setAllPosts(data.getAllPosts)
	})

	if (user.token === '') {
		return <Redirect to="/login"></Redirect>
	}

	async function createPost(e) {
		e.preventDefault()
		if (titleInput === '' || descriptionInput === '') {
			setCreatePostMessage('Form is incomplete')
		} else {
			let newPost = await createNewPost({
				variables: {
					createPostTitle: titleInput,
					createPostDescription: descriptionInput,
					createPostCreatorUsername: user.username,
					createPostCreatorId: user._id,
				},
			})
			if (newPost.data.createPost.title !== '') {
				setTitleInput('')
				setDescriptionInput('')
				setAddPostButtonText('Add post')
				setShowAddPostForm(false)
				setCreatePostMessage('')
			} else {
				setCreatePostMessage('Post with that title already exists.')
			}
		}
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
		<div className="Posts">
			<h1>Posts</h1>
			<button
				onClick={() => {
					if (showAddPostForm) {
						setAddPostButtonText('Add post')
						setShowAddPostForm(false)
					} else {
						setAddPostButtonText('Close form')
						setShowAddPostForm(true)
					}
				}}
			>
				{addPostButtonText}
			</button>
			<button
				onClick={() => {
					setRedirect(true)
				}}
			>
				My posts
			</button>
			{redirect ? <Redirect push to="/myposts"></Redirect> : null}

			{showAddPostForm ? (
				<div>
					<h1>Create post</h1>
					<form onSubmit={createPost}>
						<label htmlFor="title">Title: </label>
						<input
							type="text"
							id="title"
							name="title"
							value={titleInput}
							onChange={(e) => setTitleInput(e.target.value)}
						/>
						<br />
						<br />
						<label htmlFor="description">Description: </label>
						<textarea
							type="text"
							id="description"
							name="description"
							value={descriptionInput}
							onChange={(e) => setDescriptionInput(e.target.value)}
						/>
						<br />
						<br />
						<input type="submit" value="Submit" />
					</form>
					<p>{createPostMessage}</p>
				</div>
			) : null}

			{allPosts.map(
				({
					_id,
					title,
					description,
					upvotes,
					downvotes,
					comments,
					showComments,
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
						<form onSubmit={createComment} className="commentForm">
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

export default Posts
