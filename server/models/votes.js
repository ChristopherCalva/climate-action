const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Vote = new Schema({
	voteType: {
		type: Boolean,
		required: true,
	},
	postId: {
		type: 'String',
		required: true,
	},
	creatorId: {
		type: 'String',
		required: true,
	},
})
module.exports = mongoose.model('Vote', Vote)
