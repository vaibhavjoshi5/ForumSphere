const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.get('/', async (request, response) => {
  const user = await User.findById(request.user.id)
    .populate('following', 'userName firstName lastName')
    .populate('followers', 'userName firstName lastName')
    .populate('saved')
  response.status(200).json(user)
})

userRouter.put('/', async (request, response) => {
  const user = request.user
  const body = request.body

  const existingUser = await User.findById(user.id)
  if (!existingUser)
    return response.status(404).json({ error: 'User not found' })

  if (body.userName && body.userName !== user.userName)
    return response.status(400).json({ error: 'Username cannot be changed' })

  let passwordHash = null

  if (body.password) {
    const saltRounds = 10
    passwordHash = await bcrypt.hash(body.password, saltRounds)
  }

  const saved = Array.isArray(body.saved)
    ? body.saved.map(item => item.id || item)
    : user.saved.map(item => item.id || item)

  const newUserDetails = {
    firstName: body.firstName,
    lastName: body.lastName,
    userName: body.userName,
    email: body.email,
    age: body.age,
    contactNumber: body.contactNumber,
    passwordHash: passwordHash || user.passwordHash,
    followers: user.followers || [],
    following: user.following || [],
    owner: user.owner || [],
    saved,
    left: user.left || []
  }

  const updatedUser = await User.findByIdAndUpdate(user.id, newUserDetails, { new: true })
  response.status(200).json(updatedUser)
})

userRouter.put('/followers/:id', async (request, response) => {
  const user = request.user
  const deletedUserID = request.params.id
  const deletedUser = await User.findById(deletedUserID)
  if (!deletedUser)
    return response.status(404).json({ error: 'User not found' })

  user.followers = user.followers.filter(follower => follower.id.toString() !== deletedUserID.toString())
  deletedUser.following = deletedUser.following.filter(followingUser => followingUser.toString() !== user.id.toString())

  await Promise.all([user.save(), deletedUser.save()])
  const populatedUser = await User.findById(user.id)
    .populate('following', 'userName firstName lastName')
    .populate('followers', 'userName firstName lastName')
    .populate('saved')
  response.status(200).json(populatedUser)
})

userRouter.put('/following/:id', async (request, response) => {
  const user = request.user
  const deletedUserID = request.params.id
  
  user.following = user.following.filter(followingUser => followingUser.toString() !== deletedUserID.toString())
  const deletedUser = await User.findById(deletedUserID)
  if (!deletedUser)
    return response.status(404).json({ error: 'User not found' })

  deletedUser.followers = deletedUser.followers.filter(follower => follower.toString() !== user.id.toString())
  await Promise.all([user.save(), deletedUser.save()])

  const populatedUser = await User.findById(user.id)
    .populate('following', 'userName firstName lastName')
    .populate('followers', 'userName firstName lastName')
    .populate('saved')
  
  response.status(200).json(populatedUser)
})

userRouter.post('/following/:id', async (request, response) => {
  const user = request.user
  const userId = request.params.id

  if (user.id.toString() === userId.toString())
    return response.status(400).json({ error: 'You cannot follow yourself' })

  const followingUser = await User.findById(userId)
  if (!followingUser)
    return response.status(404).json({ error: 'User not found' })

  const isAlreadyFollowing = user.following.some(followingUser => followingUser.toString() === userId.toString())
  
  if (!isAlreadyFollowing) {
    user.following = user.following.concat(userId)
    const isAlreadyFollower = followingUser.followers.some(follower => follower.toString() === user.id.toString())
    if (!isAlreadyFollower)
      followingUser.followers = followingUser.followers.concat(user.id)
    await Promise.all([user.save(), followingUser.save()])

    // Return populated user data
    const populatedUser = await User.findById(user.id)
      .populate('following', 'userName firstName lastName')
      .populate('followers', 'userName firstName lastName')
      .populate('saved')

    response.status(201).json(populatedUser)
  } else {
    response.status(409).json({ error: 'Already following user' })
  }
})

module.exports = userRouter
