const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const signinRouter = require('express').Router()
const User = require('../models/user')

signinRouter.post('/', async (request, response) => {
  const { userName, password } = request.body

  const user = await User.findOne({ userName })
  const passwordCorrect = user === null
    ? false
    : bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    userName: user.userName,
    id: user._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET)


  response
    .status(200)
    .send({ token, ...userForToken })
})

module.exports = signinRouter
