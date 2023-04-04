import { Document } from 'mongoose'
import { Iuser, IuserUpdateDetail } from '../interfaces/user'
import { Cart } from '../models/cart'
import { User } from '../models/user'
import { Order } from '../models/order'
export const createUser = async (
  doc: Iuser,
  allowAdmin: boolean
): Promise<Document<unknown, any, Iuser>> => {
  if (doc.email) {
    doc.email = doc.email.toLowerCase()
  }

  const lowerCaseDocEmail = doc.email
  const existingUserByEmail = await findExistingUser(lowerCaseDocEmail)
  if (existingUserByEmail) {
    throw { status: 400, message: 'Email already in use' }
  }
  if (doc.role && doc.role === 'admin' && !allowAdmin) {
    throw { status: 400, message: 'invalid role' }
  }
  const user = new User(doc)
  return await user.save()
}
export const findUser = async (email: string): Promise<Iuser[]> => {
  const lowerCaseEmail = email.toLowerCase()
  return await User.find({ email: lowerCaseEmail })
}
export const findUsers = async (): Promise<Iuser[]> => {
  return await User.find()
}

export const findExistingUser = async (email: string): Promise<boolean> => {
  const lowerCaseEmail = email.toLowerCase()
  const userExists = await User.findOne({ email: lowerCaseEmail })
  if (userExists) return true
  else return false
}

export const updateUser = async (
  email: string,
  doc: IuserUpdateDetail
): Promise<Document<unknown, any, Iuser>> => {
  const cartExists = await Cart.findOne({ customer: email.toLowerCase() })
  const orders = await Order.find({ customerEmail: email.toLowerCase() })
  if (doc.email) {
    doc.email = doc.email.toLowerCase()
  }

  const lowerCaseDocEmail = doc.email
  if (doc.email && cartExists) {
    await Cart.findOneAndUpdate(
      { customer: email.toLowerCase() },
      { $set: { customer: lowerCaseDocEmail } },
      { upsert: true }
    )
  }
  if (doc.email && orders.length) {
    for (const order of orders) { 
      await Order.findOneAndUpdate(
        { customerEmail: order.customerEmail },
        { $set: { customerEmail: lowerCaseDocEmail } },
        { upsert: true }
      )
    }
  }
  const updatedUser = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: doc },
    { upsert: true, new: true }
  )

  return updatedUser
}
