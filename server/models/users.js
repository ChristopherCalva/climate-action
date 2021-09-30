const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const environment = process.env.NODE_ENV
const stage = require('../config')[environment]

const Schema = mongoose.Schema

const User = new Schema({
	username: {
		type: 'String',
		required: true,
		trim: true,
		unique: true,
	},
	password: {
		type: 'String',
		required: true,
		trim: true,
	},
	email: {
		type: 'String',
		required: true,
		trim: true,
		unique: true,
	},
})

// encrypt password before save
User.pre('save', function (next) {
	const user = this
	if (!user.isModified || !user.isNew) {
		// don't rehash if it's an old user
		next()
	} else {
		bcrypt.hash(user.password, stage.saltingRounds, function (err, hash) {
			if (err) {
				console.log('Error hashing password for user', user.username)
				next(err)
			} else {
				user.password = hash
				next()
			}
		})
	}
})

module.exports = mongoose.model('User', User)
