const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name must not be empty']
  },
  lastName: {
    type: String,
    required: [true, 'Last name must not be empty']
  },
  userName: {
    type: String,
    required: [true, 'Username must not be empty']
  },
  email: {
    type: String,
    required: [true, 'Email must not be empty']
  },
  age: {
    type: Number,
    required: [true, 'Age must not be empty']
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number must not be empty']
  },
  passwordHash: String,
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  owner: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subgreddiit'
    }
  ],
  saved: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    }
  ],
  left: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subgreddiit'
    }
  ]
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    if (returnedObject._id)
      returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User