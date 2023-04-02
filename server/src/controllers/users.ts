import { Document } from 'mongoose'
import { Iuser, IuserUpdateDetail } from '../interfaces/user'
import { Cart } from '../models/cart'
import { User } from '../models/user'
export const createUser = async (
  doc: Iuser
): Promise<Document<unknown, any, Iuser>> => {
  const existingUserByEmail = await findExistingUser(doc.email)
  if (existingUserByEmail) {
    throw { status: 400, message: 'Email already in use' }
  }
  if (doc.role && doc.role === 'admin') {
    throw { status: 400, message: 'invalid role' }
  }
  const user = new User(doc)
  return await user.save()
}
export const findUser = async (email: string): Promise<Iuser[]> => {
  return await User.find({ email: email })
}
export const findUsers = async (): Promise<Iuser[]> => {
  return await User.find()
}

export const findExistingUser = async (email: string): Promise<boolean> => {
  const userExists = await User.findOne({ email: email })
  if (userExists) return true
  else return false
}

export const updateUser = async (
  email: string,
  doc: IuserUpdateDetail
): Promise<Document<unknown, any, Iuser>> => {
  const cartExists = await Cart.findOne({ customer: email })
  if (doc.email && cartExists) {
    await Cart.findOneAndUpdate(
      { customer: email },
      { $set: { customer: doc.email } },
      { upsert: true }
    )
  }
  const updatedUser = await User.findOneAndUpdate(
    { email: email },
    { $set: doc },
    { upsert: true, new: true }
  )
  return updatedUser
}
