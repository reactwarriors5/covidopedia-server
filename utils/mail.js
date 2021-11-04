import nodemailer from 'nodemailer'

export const resetEmail = async (userEmail, shortCode) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_ID, // Email Address(Gmail)
      pass: process.env.PASSWORD, // Password(App Password)
    },
  })

  // send mail with defined transport object
  let info = await transporter
    .sendMail({
      from: '"Covidopedia" <support@covidopedia.com>', // sender address
      to: userEmail, // list of receivers or a single receiver
      subject: 'Password Reset Request | Covidopedia', // Subject line
      html: `
      <h1>Reset password</h1>
      <p>Use this code to reset your password</p>
      <h2 style="color:red;">${shortCode}</h2>
      <b>&#169; Covidopedia</b>`, // html body
    })
    .catch(error => {
      console.log(error)
    })

  console.log('Message sent: ', info.messageId)
}

export const welcomeEmail = async (userEmail, userName, userId) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_ID, // Email Address(Gmail)
      pass: process.env.PASSWORD, // Password(App Password)
    },
  })

  // send mail with defined transport object
  let info = await transporter
    .sendMail({
      from: '"Covidopedia" <support@covidopedia.com>', // sender address
      to: userEmail, // list of receivers or a single receiver
      subject: 'Registration Successful | Covidopedia', // Subject line
      html: `
      <h1>Welcome to Covidopedia</h1>
      <p>Hello ${userName}. Your registration is complete.</p>
      <p>Your user id is: <span style="color:red;">${userId}</span></p>
      <br>
      <b>&#169; Covidopedia</b>`, // html body
    })
    .catch(error => {
      console.log(error)
    })

  console.log('Message sent: ', info.messageId)
}

export const prescriptionEmail = async ({ userEmail, prescriptionUrl }) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_ID, // Email Address(Gmail)
      pass: process.env.PASSWORD, // Password(App Password)
    },
  })

  // send mail with defined transport object
  let info = await transporter
    .sendMail({
      from: '"Covidopedia" <support@covidopedia.com>', // sender address
      to: userEmail, // list of receivers or a single receiver
      subject: 'Download Prescription | Covidopedia', // Subject line
      html: `
      <h1>Download Prescription</h1>
      <p>You can download your prescription by clicking on the link below.</p>
      <p><a href=${prescriptionUrl}>Download Prescription</a></p>
      <b>&#169; Covidopedia</b>`, // html body
    })
    .catch(error => {
      console.log(error)
    })

  console.log('Message sent: ', info.messageId)
}
