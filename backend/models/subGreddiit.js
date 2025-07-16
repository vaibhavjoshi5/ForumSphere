const mongoose = require('mongoose')

const subGreddiit = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name must not be empty']
  },
  description: String,
  tags: [
    {
      type: String
    }
  ],
  bannedKeywords: [
    {
      type: String
    }
  ],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  blocked: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  requests: [
    {
      userDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      requestDate: Date,
      rejected: Boolean
    }
  ],
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    }
  ],
  reports: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report'
    }
  ],
  creationDate: Date,
  imageUrl: String
})

subGreddiit.set('toJSON', {
  transform: (document, returnedObject) => {
    if (returnedObject._id)
      returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const SubGreddiit = mongoose.model('SubGreddiit', subGreddiit)

module.exports = SubGreddiit