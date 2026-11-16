const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const signinRouter = require('express').Router()
const User = require('../models/user')

signinRouter.post('/', async (request, response) => {
  const { userName, email, password } = request.body || {}
  const identifier = email === undefined ? userName : email
  if (typeof identifier !== 'string' || !identifier.trim() || typeof password !== 'string' || !password)
    return response.status(400).json({ error: 'Enter your username or email and password' })
  const query = email === undefined
    ? { userName: identifier.trim() }
    : { email: identifier.trim().toLowerCase() }

  const user = await User.findOne(query)
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    userName: user.userName,
    id: user.id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: '7d' })


  response
    .status(200)
    .send({ token, ...userForToken })
})

module.exports = signinRouter
