import User from '../models/user'
import { nanoid } from 'nanoid'
const imgbbUploader = require('imgbb-uploader')
import queryString from 'query-string'
const stripe = require('stripe')(process.env.STRIPE_SECRET)

// Handle Image
export const uploadImage = async (req, res) => {
  try {
    const { image } = req.body
    if (!image) return res.status(400).send('No image')

    // Upload image in imgbb
    const options = {
      apiKey: process.env.IMGBB_API_KEY,
      base64string: image,
      name: nanoid(5),
    }
    imgbbUploader(options)
      .then(response => {
        res.json({
          display_url: response.display_url,
          delete_url: response.delete_url,
        })
      })
      .catch(error => console.error(error))
  } catch (err) {
    console.log(err)
  }
}

//Doctor Registration
export const doctorRegistration = async (req, res) => {
  try {
    // Data From Front-End
    const {
      name,
      email,
      image,
      degree,
      department,
      fee,
      biography,
      hospital,
      from,
      to,
      designation,
      address,
      city,
      country,
    } = req.body

    //validation
    if (!name) return res.status(400).send('Name is required')
    if (!image) return res.status(400).send('image is required')
    if (!degree) return res.status(400).send('degree is required')
    if (!department) return res.status(400).send('department is required')
    if (!email) return res.status(400).send('Email is required')
    if (!fee) return res.status(400).send('Fee is required')
    if (!biography) return res.status(400).send('Biography is required')

    if (!hospital) return res.status(400).send('Hospital is required')
    if (!from) return res.status(400).send('From is required')
    if (!to) return res.status(400).send('To is required')
    if (!designation) return res.status(400).send('Designation is required')
    if (!address) return res.status(400).send('Address is required')
    if (!city) return res.status(400).send('City is required')
    if (!country) return res.status(400).send('Country is required')

    let userExist = await User.findOne({ email }).exec()
    if (!userExist)
      return res
        .status(400)
        .send('you have to give the email with which you logged in')

    //Compare with exiting email & update
    const user = await User.findOneAndUpdate(
      {
        email,
      },
      {
        name,
        image,
        degree,
        department,
        fee,
        biography,
        hospital,
        from,
        to,
        designation,
        address,
        city,
        country,
      },
      {
        new: true,
      }
    ).exec()
    console.log(user)

    // 2. if user dont have stripe_account_id yet, then create new
    if (!user.stripe_account_id) {
      const account = await stripe.accounts.create({ type: 'express' })

      user.stripe_account_id = account.id
      user.save()
    }
    // 3. create account link based on account id (for frontend to complete onboarding)
    let accountLink = await stripe.accountLinks.create({
      account: user.stripe_account_id,
      refresh_url: process.env.STRIPE_REDIRECT_URL,
      return_url: process.env.STRIPE_REDIRECT_URL,
      type: 'account_onboarding',
    })

    // 4. pre-fill any info such as email (optional), then send url response to frontend
    accountLink = Object.assign(accountLink, {
      'stripe_user[email]': user.email,
    })
    // 5. then send the account link as response to frontend
    res.send(`${accountLink.url}?${queryString.stringify(accountLink)}`)

    //Send success response to front-end
  } catch (err) {
    console.log(err)
    return res.status(400).send('Error. Try again.')
  }
}

export const getAccountStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).exec()
    const account = await stripe.accounts.retrieve(user.stripe_account_id)

    if (!account.charges_enabled) {
      return res.status(401).send('Unauthorized')
    } else {
      const statusUpdated = await User.findByIdAndUpdate(
        user._id,
        {
          stripe_seller: account,
          role: 'doctor',
        },
        { new: true }
      )
        .select('-password')
        .exec()
      res.json(statusUpdated)
    }
  } catch (err) {
    console.log(err)
  }
}

// Get all doctors
export const doctors = async (req, res) => {
  const all = await User.find({ role: 'doctor' }).exec()
  res.json(all)
}

// Get a single Doctor
export const read = async (req, res) => {
  const id = req.params.doctorId
  console.log(id)
  try {
    const doctor = await User.findOne({ _id: id }).exec()
    res.json(doctor)
    console.log(doctor)
  } catch (err) {
    console.log(err)
  }
}
