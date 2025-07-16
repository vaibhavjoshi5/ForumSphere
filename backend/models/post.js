const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Post data must not be empty']
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Posting user id must not be empty']
  },
  postedIn: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'SubGreddiit id must not be empty']
  },
  upvotes: Number,
  downvotes: Number,
  replies: [
    {
      type: String
    }
  ],
  upvotedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  downvotedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})

postSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    if (returnedObject._id)
      returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Post = mongoose.model('Post', postSchema)

module.exports = Post