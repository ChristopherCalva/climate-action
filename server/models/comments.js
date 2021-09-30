const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Comment = new Schema({
	description: {
		type: 'String',
		required: true,
		trim: true,
	},
	postId: {
		type: 'String',
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
module.exports = mongoose.model('Comment', Comment)
