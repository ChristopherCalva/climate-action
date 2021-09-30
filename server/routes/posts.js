const controller = require('../controllers/posts')

module.exports = (router) => {
	router.route('/posts').post(controller.add).get(controller.getAll)
}
