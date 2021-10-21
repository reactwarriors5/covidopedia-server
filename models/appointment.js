import mongoose from 'mongoose'
const { Schema } = mongoose
const { ObjectId } = Schema

const appointmentSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    patient: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Appointment', appointmentSchema)
