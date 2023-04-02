import { model, Schema } from 'mongoose'
import { Iuser } from '../interfaces/user'

const userSchema = new Schema<Iuser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  billingAddress: {
    city: { type: String, required: true },
    street: { type: String, required: true },
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
})

export const User = model<Iuser>('User', userSchema)
