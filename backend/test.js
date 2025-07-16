const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS
  }
})

const mailOptions = {
  from: process.env.NODEMAILER_USER,
  to: 'punnavajhala.prakash@research.iiit.ac.in',
  subject: 'Gonna succeed',
  text: 'Jai Gurudeva!'
}

transporter.sendMail(mailOptions, (error, info) => {
  if (error)
    console.log(error)
  else
    console.log(info.response)
})