const nodemailer = require('nodemailer')
const config = require('./config')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.NODEMAILER_USER,
    pass: config.NODEMAILER_PASS
  }
})

const mailFn = (recipient, action, data) => {
  const mailData = {
    from: config.NODEMAILER_USER,
    to: recipient,
    subject: action,
    text: data
  }

  transporter.sendMail(mailData)
}

module.exports = { mailFn }