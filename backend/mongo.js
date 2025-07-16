const mongoose = require('mongoose')
require('dotenv').config()
const User = require('./models/user')

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('connected')

    User.find({}).then(res => {
      res.forEach(x => console.log(typeof x))
      mongoose.connection.close()
    })
  })
  .catch(err => console.log(err))
