const mongoose = require('mongoose')
const Post = require('../models/posts')

const connUri = process.env.MONGO_LOCAL_CONN_URL

module.exports = {
	add: (req, res) => {
		mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
			let result = {}
			let status = 201
			if (!err) {
				const { title, description, upvotes, downvotes, creatorId } = req.body
				const post = new Post({
					title,
					description,
					upvotes,
					downvotes,
					creatorId,
				}) // document = instance of a model
				post.save((err, post) => {
					if (!err) {
						result.status = status
						result.result = post
					} else {
						status = 500
						result.status = status
						result.error = err
					}
					res.status(status).send(result)
				})
			} else {
				status = 500
				result.status = status
				result.error = err
				res.status(status).send(result)
			}
		})
	},
	getAll: (req, res) => {
		mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
			let result = {}
			let status = 200
			if (!err) {
				Post.find({}, (err, posts) => {
					if (!err) {
						result.status = status
						result.error = err
						result.result = posts
					} else {
						status = 500
						result.status = status
						result.error = err
					}
					res.status(status).send(result)
				})
			} else {
				status = 500
				result.status = status
				result.error = err
				res.status(status).send(result)
			}
		})
	},
}
