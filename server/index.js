require('dotenv').config()

const { ApolloServer, gql } = require('apollo-server-express')
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core')
const http = require('http')
const express = require('express')
const logger = require('morgan')
const cors = require('cors')

// Mongoose
const mongoose = require('mongoose')
const Post = require('./models/posts')
// Router set up
const router = express.Router()
const routes = require('./routes/index.js')

// GraphQL typeDefs and resolvers
const { typeDefs } = require('./graphql/typeDefs')
const { resolvers } = require('./graphql/resolvers')

const environment = process.env.NODE_ENV // development
const stage = require('./config')[environment]

// Apollo server
async function startApolloServer(typeDefs, resolvers) {
	// create mongodb connection here
	const app = express()
	const httpServer = http.createServer(app)
	const server = new ApolloServer({
		typeDefs,
		resolvers,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	})
	await server.start()

	app.use(cors())
	app.use(express.urlencoded({ extended: true }))
	app.use(express.json())

	if (environment !== 'production') {
		app.use(logger('dev'))
	}

	app.use('/', routes(router))

	// app.get('/', function (req, res) {
	// 	res.send('hello world')
	// })

	server.applyMiddleware({ app })

	await new Promise((resolve) =>
		httpServer.listen({ port: stage.port }, resolve)
	)
	console.log(
		`🚀 Server ready at http://localhost:${stage.port}${server.graphqlPath}`
	)
}

// Initiate apollo server
startApolloServer(typeDefs, resolvers)
