const mongoose = require('mongoose')
const config = require('./config')
const logger = require('./logger')

let connectionPromise

const connectDB = async () => {
  if (mongoose.connection.readyState === 1)
    return mongoose.connection

  if (!config.MONGODB_URI)
    throw new Error('MONGODB_URI environment variable is required')

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(config.MONGODB_URI)
      .then(() => {
        logger.info('connected to MongoDB')
        return mongoose.connection
      })
      .catch(error => {
        connectionPromise = null
        throw error
      })
  }

  return connectionPromise
}

module.exports = connectDB
