require('express-async-errors')
const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

const signinRouter = require('./controllers/signin')
const signupRouter = require('./controllers/signup')
const userRouter = require('./controllers/userFields')
const mySubgreddiitRouter = require('./controllers/mySubgreddiitFields')
const subgreddiitRouter = require('./controllers/subGreddiitFields')

const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const savedPostsRouter = require('./controllers/postFields')

logger.info('connecting to', config.MONGODB_URI)

const connectDB = async () => {
  mongoose.connect(config.MONGODB_URI)
  logger.info('connected to MongoDB')
}
connectDB()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/signin', signinRouter)
app.use('/api/signup', signupRouter)

app.use(middleware.extractToken)
app.use(middleware.extractUser)

app.use('/api/profile', userRouter)
app.use('/api/mysubhubs', mySubgreddiitRouter)
app.use('/api/allsubhubs', subgreddiitRouter)
app.use('/api/savedposts', savedPostsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
