const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  },
  reportedUser: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  },
  concern: {
    type: String,
    required: [true, 'Concern must not be empty']
  },
  postId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Post'
  },
  action: String,
  reportedDate: Date
})

reportSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    if (returnedObject._id)
      returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Report = mongoose.model('Report', reportSchema)

module.exports = Report