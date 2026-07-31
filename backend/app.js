require('express-async-errors')
const express = require('express')
const app = express()
const cors = require('cors')

const signinRouter = require('./controllers/signin')
const signupRouter = require('./controllers/signup')
const userRouter = require('./controllers/userFields')
const mySubgreddiitRouter = require('./controllers/mySubgreddiitFields')
const subgreddiitRouter = require('./controllers/subGreddiitFields')

const middleware = require('./utils/middleware')
const savedPostsRouter = require('./controllers/postFields')
const connectDB = require('./utils/db')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)

app.get('/api/health', (request, response) => response.json({ status: 'ok' }))
const ensureDatabase = async (request, response, next) => {
  await connectDB()
  next()
}

app.use('/api/signin', ensureDatabase, signinRouter)
app.use('/api/signup', ensureDatabase, signupRouter)

app.use(middleware.extractToken)
app.use(async (request, response, next) => {
  if (request.token)
    await connectDB()
  next()
})
app.use(middleware.extractUser)

app.use('/api/profile', userRouter)
app.use('/api/mysubhubs', mySubgreddiitRouter)
app.use('/api/allsubhubs', subgreddiitRouter)
app.use('/api/savedposts', savedPostsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
