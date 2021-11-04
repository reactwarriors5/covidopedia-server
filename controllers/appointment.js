import User from '../models/user'
import Appointment from '../models/appointment'
const stripe = require('stripe')(process.env.STRIPE_SECRET)
const pdf = require('html-pdf')
import { unlink, readFileSync } from 'fs'
const pdfTemplate = require('../documents')
const cloudinary = require('cloudinary').v2
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})
import { prescriptionEmail } from '../utils/mail'

export const setAppointment = async (req, res) => {
  try {
    //Received Data From Front-End
    const { name, age, gender, message, fee, doctor } = req.body
    //validation
    if (!name) return res.status(400).send('Name is required')
    if (!age) return res.status(400).send('Age is required')
    if (!gender) return res.status(400).send('Gender is required')
    if (!message) return res.status(400).send('Message is required')

    // User validation
    let userExist = await User.findOne({ _id: req.user._id }).exec()
    if (!userExist) return res.status(400).send('User Not Found!')

    const appointment = await new Appointment({
      patient: req.user._id,
      ...req.body,
    }).save()

    let doctorDetails = await User.findOne({ _id: doctor }).exec()
    //Application Fee 10%
    const platformFee = (fee * 10) / 100

    // Create stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      // purchase details
      line_items: [
        {
          name: 'Appointment Fee',
          amount: Math.round(fee.toFixed(2) * 100),
          currency: 'usd',
          quantity: 1,
        },
      ],
      // Charge buyer & transfer remaining balance to seller (after fee)
      payment_intent_data: {
        application_fee_amount: Math.round(platformFee.toFixed(2) * 100),
        transfer_data: {
          destination: doctorDetails.stripe_account_id,
        },
      },
      // Redirect url after successful payment
      success_url: `${process.env.STRIPE_SUCCESS_URL}/${appointment._id}`,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    })
    console.log('Session Id---->', session)

    await User.findByIdAndUpdate(req.user._id, {
      stripeSession: session,
    }).exec()

    res.send(session.id)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Appointment create failed. Try again.')
  }
}

// Fetch all appointments of a patient
export const patientAppointments = async (req, res) => {
  const all = await Appointment.find({ patient: req.user._id })
    .populate('doctor', '_id name department image')
    .exec()
  // console.log("============> ", all);
  res.json(all)
}
// Get all patient
export const patients = async (req, res) => {
  const all = await Appointment.find().exec()
  res.json(all)
}

export const doctorAppointments = async (req, res) => {
  const all = await Appointment.find({ doctor: req.user._id })
    .populate('patient', '_id name')
    .exec()
  // console.log("============> ", all);
  res.json(all)
}

export const stripeSuccess = async (req, res) => {
  try {
    // Find appointment
    const appointment = await Appointment.findById(
      req.params.appointmentId
    ).exec()
    // Get user from db to get stripe session id
    const user = await User.findById(req.user._id).exec()
    // If no stripe session id -> Return
    if (!user.stripeSession.id) return res.sendStatus(400)
    // retrieve stripe session
    const session = await stripe.checkout.sessions.retrieve(
      user.stripeSession.id
    )
    console.log('STRIPE SUCCESS--->', session)
    // If session payment status is paid, push course to user's course array.
    if (session.payment_status === 'paid') {
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { appointments: appointment._id },
        $set: { stripeSession: {} },
      }).exec()
    }
    res.json({ success: true, appointment })
  } catch (err) {
    console.log('Stripe Success Error-->', err)
    res.json({ success: false })
  }
}

export const createPdf = async (req, res) => {
  const data = req.body
  const doctorDetails = await User.findOne({ _id: data.doctor }).exec()
  const { name, department } = doctorDetails
  const pdfData = { ...data, name, department }

  pdf.create(pdfTemplate(pdfData), {}).toFile('prescription.pdf', err => {
    if (err) {
      res.send(Promise.reject())
    }
    res.send(Promise.resolve())
  })
}

export const uploadPdf = async (req, res) => {
  const appointment = await Appointment.findById(req.body.appointmentId).exec()
  // return console.log(appointment)
  cloudinary.uploader.upload(
    `${process.cwd()}/prescription.pdf`,
    { flag: 'attachment' },
    function (error, result) {
      if (error) {
        console.log(error)
        return res.sendStatus(400)
      }
      // Delete pdf from server directory
      unlink(`${process.cwd()}/prescription.pdf`, err => {
        if (err) throw err
        console.log(`Successfully deleted ${process.cwd()}/prescription.pdf`)
      })
      const emailData = {
        userEmail: appointment.email,
        prescriptionUrl: result.secure_url,
      }
      prescriptionEmail(emailData)
      updateStatus(result.secure_url)
    }
  )

  const updateStatus = async url => {
    const statusUpdated = await Appointment.findByIdAndUpdate(
      req.body.appointmentId,
      {
        status: 'Complete',
        prescription: url,
      },
      { new: true }
    ).exec()
    res.json(statusUpdated)
    console.log(statusUpdated)
  }
}

// export const fetchPdf = async (req, res) => {
//   res.sendFile(`${process.cwd()}/prescription.pdf`)
// }

export const deletePdf = async (req, res) => {
  unlink(`${process.cwd()}/prescription.pdf`, err => {
    if (err) throw err
    console.log(`Successfully deleted ${process.cwd()}/prescription.pdf`)
  })
}
