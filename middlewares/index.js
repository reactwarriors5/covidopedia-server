import expressJwt from 'express-jwt'
import User from '../models/user'

//Extract token from cookie and check user id.
export const requireSignin = expressJwt({
  getToken: (req, res) => req.cookies.token,
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
})

export const isDoctor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).exec()
    if (!user.role.includes('Doctor')) {
      return res.sendStatus(403)
    } else {
      next()
    }
  } catch (err) {
    console.log(err)
  }
}
