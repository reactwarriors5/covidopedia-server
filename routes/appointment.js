import express from 'express'
const router = express.Router()

// middleware
import { requireSignin } from '../middlewares'

// controllers
import {
  patientAppointments,
  setAppointment,
  doctorAppointments,
  stripeSuccess,
  createPdf,
  deletePdf,
  uploadPdf,
  patients,
} from '../controllers/appointment'

// Routes
router.get('/patient-appointments', requireSignin, patientAppointments)
router.get('/allPatient', patients)
router.get('/doctor-appointments', requireSignin, doctorAppointments)

router.post('/appointment', requireSignin, setAppointment)
router.post('/create-pdf', createPdf)
// router.get('/fetch-pdf', fetchPdf)
router.get('/delete-pdf', deletePdf)
router.post('/upload-pdf', uploadPdf)

router.get('/stripe-success/:appointmentId', requireSignin, stripeSuccess)

module.exports = router
