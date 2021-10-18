import mongoose from 'mongoose'
const { Schema } = mongoose
const { ObjectId } = Schema

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 64,
    },
    image: {
      type: String,
      default: '/avatar.png',
    },
    role: {
      type: String,
      default: 'user',
    },
    department: {
      type: String,
      trim: true,
    },
    degree: {
      type: String,
      trim: true,
    },
    fee: {
      type: Number,
    },
    experience: {
      type: String,
      trim: true,
    },
    stripe_account_id: '',
    stripe_seller: {},
    stripeSession: {},
    passwordResetCode: {
      data: String,
      default: '',
    },
    appointments: [{ type: ObjectId, ref: 'Appointment' }],
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
