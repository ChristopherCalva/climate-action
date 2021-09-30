// get the data from mongodb in this file to make queries and mutations
const mongoose = require('mongoose')

// models
const User = require('../models/users')
const Post = require('../models/posts')
const Comment = require('../models/comments')
const Vote = require('../models/votes')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const connUri = process.env.MONGO_LOCAL_CONN_URL

// TODO: refactor the getAllPosts and getPostsByUserId queries

const resolvers = {
	Query: {
		getAllPosts: async (parent, args) => {
			await mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
				let allPosts = []
				if (!err) {
					Post.find({}, (err, posts) => {
						if (!err) {
							allPosts = posts
						} else {
							return []
						}
					})
				} else {
					return []
				}
				return allPosts
			})
			const posts = await Post.find({}).sort({ upvotes: -1 }).exec()
			// mongoose.disconnect()
			return posts.map((x) => x)
		},
		getPostsByUserId: async (parent, args) => {
			const { userId } = args
			await mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
				let allPosts = []
				if (!err) {
					Post.find({}, (err, posts) => {
						if (!err) {
							allPosts = posts
						} else {
							return []
						}
					})
				} else {
					return []
				}
				return allPosts
			})
			const posts = await Post.find({ creatorId: { $in: [userId] } })
				.sort({ upvotes: -1 })
				.exec()
			// mongoose.disconnect()
			return posts.map((x) => x)
		},
	},
	Mutation: {
		login: async (root, args, context) => {
			const { username, password } = args
			// end login logic
			mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
				if (!err) {
					// do something
				} else {
					// handle error
				}
			})
			let findResult = null
			findResult = await User.findOne({ username })
			let result = { token: '', _id: '', username: '' }

			if (findResult !== null) {
				await bcrypt
					.compare(password, findResult.password)
					.then((match) => {
						if (match) {
							// Create a token
							const payload = { username }
							// const payload = { user: username }
							const options = {
								expiresIn: '2d',
								issuer: 'https://scotch.io',
							}
							const secret = process.env.JWT_SECRET
							const token = jwt.sign(payload, secret, options)

							// console.log('TOKEN', token);
							result.token = token
							result._id = findResult._id
							result.username = findResult.username
						} else {
							// TODO: Fix the error handling here
							throw new Error('Passwords do not match')
						}
						return result
					})
					.catch((err) => {
						result.error = err
						return result
					})
			} else {
				return { token: '', _id: 'notfound', username: '' }
			}

			return result
		},
		register: async (root, args, context) => {
			const { username, password, email } = args
			mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
				if (!err) {
					// do something
				} else {
					// handle error
				}
			})

			try {
				const user = new User({ username, password, email }) // document = instance of a model
				let saveUser = await user.save()
				// Create a token
				const payload = { user: user.username }
				const options = {
					expiresIn: '2d',
					issuer: 'https://scotch.io',
				}
				const secret = process.env.JWT_SECRET
				const token = jwt.sign(payload, secret, options)
				return { token: token, _id: saveUser._id, username: saveUser.username }
			} catch (error) {
				return { token: '', _id: '', username: '' }
			}
		},
		createPost: async (root, args, context) => {
			const { title, description, creatorId, creatorUsername } = args
			// use args and new variables to  create post and return all parts of model
			mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
				if (!err) {
					// do somehintg
				} else {
					// handle error
				}
			})
			try {
				let upvotes = 0
				let downvotes = 0
				let votes = []
				let comments = []
				let showComments = false
				const post = new Post({
					title,
					description,
					upvotes,
					downvotes,
					votes,
					comments,
					showComments,
					creatorUsername,
					creatorId,
				}) // document = instance of a model
				let savePost = await post.save()
				return {
					_id: savePost._id,
					title: savePost.title,
					description: savePost.description,
					upvotes: savePost.upvotes,
					downvotes: savePost.downvotes,
					votes: savePost.votes,
					comments: savePost.comments,
					showComments: savePost.showComments,
					creatorUsername: savePost.creatorUsername,
					creatorId: savePost.creatorId,
				}
			} catch (error) {
				return {
					_id: '',
					title: '',
					description: '',
					upvotes: 0,
					downvotes: 0,
					votes: [],
					comments: [],
					showComments: false,
					creatorId: '',
					creatorUsername: '',
				}
			}
		},
		createComment: async (root, args, context) => {
			const { description, postId, creatorUsername, creatorId } = args
			mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
				if (!err) {
					// do somehintg
				} else {
					// handle error
				}
			})
			try {
				const comment = new Comment({
					description,
					postId,
					creatorUsername,
					creatorId,
				}) // document = instance of a model
				let saveComment = await comment.save()
				await Post.updateOne(
					{ _id: postId },
					{ $push: { comments: saveComment } }
				)
				return {
					description: saveComment.description,
					postId: saveComment.postId,
					creatorUsername: saveComment.creatorUsername,
					creatorId: saveComment.creatorId,
				}
			} catch (error) {
				return {
					description: '',
					postId: '',
					creatorUsername: '',
					creatorId: '',
				}
			}
		},
		voteOnPost: async (root, args, context) => {
			// true means upvote, false means downvote
			const { voteType, postId, creatorId } = args
			mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
				if (!err) {
					// do something
				} else {
					// handle error
				}
			})
			try {
				// see if user already voted on post

				let findPost = await Post.findById(postId)
				let findOnePost = findPost.votes.find((c) => c.creatorId === creatorId)

				// if they haven't voted, proceed with pushing the vote to the vote array
				if (findOnePost === undefined) {
					if (voteType) {
						// upvote
						const newVote = new Vote({
							voteType,
							postId,
							creatorId,
						})

						let saveVote = await newVote.save()

						await Post.findByIdAndUpdate(
							{ _id: postId },
							{ $inc: { upvotes: 1 }, $push: { votes: saveVote } }
						)

						return {
							voteType: saveVote.voteType,
							postId: saveVote.postId,
							creatorId: saveVote.creatorId,
						}
					} else {
						//downvote
						const newVote = new Vote({
							voteType,
							postId,
							creatorId,
						})

						let saveVote = await newVote.save()

						await Post.findByIdAndUpdate(
							{ _id: postId },
							{ $inc: { downvotes: 1 }, $push: { votes: saveVote } }
						)

						return {
							voteType: saveVote.voteType,
							postId: saveVote.postId,
							creatorId: saveVote.creatorId,
						}
					}
				} else {
					return {
						voteType: false,
						postId: '',
						creatorId: '',
					}
				}
			} catch (error) {
				return {
					voteType: false,
					postId: '',
					creatorId: '',
				}
			}
		},
	},
}

module.exports = { resolvers }
