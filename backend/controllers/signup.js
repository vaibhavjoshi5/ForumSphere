const bcrypt = require('bcrypt')
const signupRouter = require('express').Router()
const User = require('../models/user')

signupRouter.post('/', async (request, response) => {
  const { firstName, lastName, userName, email, age, contactNumber, password, followers, following, owner, saved, left } = request.body

  if (!firstName || !lastName || !userName || !email || !age || !contactNumber || !password)
    return response.status(400).json({ error: 'All the fields must be filled' })

  const existingUser = await User.findOne({ userName })
  if (existingUser)
    return response.status(400).json({ error: 'Username is not available to take. Please choose another username' })

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    firstName: firstName,
    lastName: lastName,
    userName: userName,
    email: email,
    age: age,
    contactNumber: contactNumber,
    passwordHash: passwordHash,
    followers: followers || [],
    following: following || [],
    owner: owner || [],
    saved: saved || [],
    left: left || []
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = signupRouter
