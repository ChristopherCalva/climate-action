const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Post = new Schema({
	title: {
		type: 'String',
		required: true,
		trim: true,
		unique: true,
	},
	description: {
		type: 'String',
		required: true,
		trim: true,
	},
	upvotes: {
		type: Number,
		required: true,
	},
	downvotes: {
		type: Number,
		required: true,
	},
	votes: {
		type: Array,
		required: true,
	},
	comments: {
		type: Array,
		required: true,
	},
	showComments: {
		type: Boolean,
		required: true,
	},
	creatorUsername: {
		type: 'String',
		required: true,
	},
	creatorId: {
		type: 'String',
		required: true,
	},
})
module.exports = mongoose.model('Post', Post)
