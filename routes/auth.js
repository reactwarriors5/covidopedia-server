import express from 'express'
const router = express.Router()

// middleware
import { requireSignin } from '../middlewares'

// controllers
import {
  register,
  login,
  logout,
  currentUser,
  forgotPassword,
  resetPassword,
  doctorRegistration,
} from '../controllers/auth'

// Routes
router.post('/register', register)
router.post('/login', login)
router.get('/logout', logout)
router.get('/current-user', requireSignin, currentUser)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.put('/doctor-registration', doctorRegistration)

module.exports = router
