import express from 'express'
const router = express.Router()

// middleware
import { requireSignin } from '../middlewares'

// controllers
import {
  doctorRegistration,
  doctors,
  uploadImage,
  read,
  getAccountStatus,
} from '../controllers/doctor'

// Routes
router.get('/doctors', doctors)
router.get('/doctor/:doctorId', read)
router.post('/get-account-status', requireSignin, getAccountStatus)
// image
router.post('/doctor/upload-image', uploadImage)
router.put('/doctor-registration', requireSignin, doctorRegistration)

module.exports = router
