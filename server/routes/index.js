const users = require('./users')
const posts = require('./posts')

module.exports = (router) => {
	users(router)
	posts(router)
	return router
}
