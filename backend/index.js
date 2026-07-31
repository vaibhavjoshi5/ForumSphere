const app = require('./app')
const http = require('http')
const config = require('./utils/config')
const logger = require('./utils/logger')
const connectDB = require('./utils/db')

const server = http.createServer(app)

const start = async () => {
  if (!process.env.SECRET)
    throw new Error('MONGODB_URI and SECRET environment variables are required')

  await connectDB()

  const port = config.PORT || 3001
  server.listen(port, () => logger.info(`Server running on port ${port}`))
}

if (process.env.VERCEL)
  module.exports = app
else
  start().catch(error => {
    logger.error('Unable to start server:', error.message)
    process.exitCode = 1
  })
