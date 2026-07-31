const savedPostsRouter = require('express').Router()
const User = require('../models/user')

savedPostsRouter.post('/:id', async (request, response) => {
  const user = request.user
  const postId = request.params.id
  let newUser = user
  if (user.saved.find(savedPost => savedPost.id.toString() === postId.toString()) === undefined) {
    user.saved = user.saved.map(savedPost => savedPost.id)
    user.saved = user.saved.concat(postId)
    newUser = await user.save()
  }

  response.status(201).json(newUser)
})

savedPostsRouter.put('/:id', async (request, response) => {
  const user = request.user
  const postId = request.params.id

  user.saved = user.saved.filter(savedPost => {
    const savedId = savedPost.id || savedPost._id || savedPost
    return savedId.toString() !== postId.toString()
  })
  const updatedUser = await user.save()

  response.status(200).json(updatedUser)
})

module.exports = savedPostsRouter
