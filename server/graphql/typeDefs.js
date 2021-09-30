const { gql } = require('apollo-server-express')

const typeDefs = gql`
	type User {
		_id: String!
		username: String!
		password: String!
		email: String!
	}

	type Comment {
		_id: String!
		description: String!
		postId: String!
		creatorUsername: String!
		creatorId: String!
	}

	type Vote {
		_id: String!
		voteType: Boolean!
		postId: String!
		creatorId: String!
	}

	type Post {
		_id: String!
		title: String!
		description: String!
		upvotes: Int!
		downvotes: Int!
		votes: [Vote!]!
		comments: [Comment!]!
		showComments: Boolean!
		creatorUsername: String!
		creatorId: String!
	}

	type LoginOutput {
		token: String!
		_id: String!
		username: String!
	}

	# Queries
	type Query {
		getAllComments: [Comment!]!
		getAllPosts: [Post!]!
		getPostsByUserId(userId: String!): [Post!]!
	}

	# Mutations
	type Mutation {
		login(username: String!, password: String!): LoginOutput!
		register(username: String!, password: String!, email: String!): LoginOutput!
		createPost(
			title: String!
			description: String!
			creatorUsername: String!
			creatorId: String!
		): Post!
		createComment(
			description: String!
			postId: String!
			creatorUsername: String!
			creatorId: String!
		): Comment!
		voteOnPost(voteType: Boolean!, postId: String!, creatorId: String!): Vote!
	}
`
module.exports = { typeDefs }
