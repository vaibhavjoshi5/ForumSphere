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
    followers: body.followers || user.followers || [],
    following: body.following || user.following || [],
    owner: body.owner || user.owner || [],
    saved,
    left: body.left || user.left || []
  }

  const updatedUser = await User.findByIdAndUpdate(user.id, newUserDetails, { new: true })
  response.status(200).json(updatedUser)
})

userRouter.put('/followers/:id', async (request, response) => {
  const user = request.user
  const deletedUserID = request.params.id
  const deletedUser = await User.findById(deletedUserID)
  deletedUser.following = deletedUser.following.filter(followingUser => followingUser.toString() !== user.id.toString())

  const updatedUser = await User.findByIdAndUpdate(deletedUserID, deletedUser, { new: true })
  response.status(200).json(updatedUser)
})

userRouter.put('/following/:id', async (request, response) => {
  const user = request.user
  const deletedUserID = request.params.id
  
  console.log('=== UNFOLLOW DEBUG ===')
  console.log('Current user:', user.userName)
  console.log('User to unfollow ID:', deletedUserID)
  console.log('Current user following before:', user.following)
  
  // Remove from current user's following list
  user.following = user.following.filter(followingUser => followingUser.toString() !== deletedUserID.toString())
  console.log('Current user following after filter:', user.following)
  
  await user.save()
  console.log('User saved successfully')
  
  // Remove from target user's followers list
  const deletedUser = await User.findById(deletedUserID)
  console.log('Target user before:', deletedUser.userName, 'followers:', deletedUser.followers)
  
  deletedUser.followers = deletedUser.followers.filter(follower => follower.toString() !== user.id.toString())
  console.log('Target user followers after filter:', deletedUser.followers)
  
  await User.findByIdAndUpdate(deletedUserID, deletedUser, { new: true })
  console.log('Target user updated successfully')
  
  // Return populated user data
  const populatedUser = await User.findById(user.id)
    .populate('following', 'userName firstName lastName')
    .populate('followers', 'userName firstName lastName')
    .populate('saved')
  
  console.log('Final populated user following:', populatedUser.following)
  console.log('=== END DEBUG ===')
  
  response.status(200).json(populatedUser)
})

userRouter.post('/following/:id', async (request, response) => {
  const user = request.user
  const userId = request.params.id

  // Check if already following (prevent duplicates)
  const isAlreadyFollowing = user.following.some(followingUser => followingUser.toString() === userId.toString())
  
  if (!isAlreadyFollowing) {
    // Add to current user's following list
    user.following = user.following.concat(userId)
    await user.save()

    // Add to target user's followers list
    const followingUser = await User.findById(userId)
    if (followingUser) {
      // Check if user is not already in followers list (prevent duplicates)
      const isAlreadyFollower = followingUser.followers.some(follower => follower.toString() === user.id.toString())
      if (!isAlreadyFollower) {
        followingUser.followers = followingUser.followers.concat(user.id)
        await followingUser.save()
      }
    }

    // Return populated user data
    const populatedUser = await User.findById(user.id)
      .populate('following', 'userName firstName lastName')
      .populate('followers', 'userName firstName lastName')
      .populate('saved')

    response.status(201).json(populatedUser)
  } else {
    response.status(400).json({ warning: 'Already following user' }).end()
  }
})

module.exports = userRouter
