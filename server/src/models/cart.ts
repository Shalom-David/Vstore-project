import { model, Schema } from 'mongoose'
import { Icart, IcartProduct } from '../interfaces/cart'

export const cartProductSchema = new Schema<IcartProduct>({
  _id: { type: String, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, max: 100 },
  totalProductPrice: { type: Number },
})

export const cartSchema = new Schema<Icart>({
  customer: { type: String, ref: 'User', required: true, unique: true },
  creationDate: { type: String, default: new Date().toLocaleString() },
  products: [cartProductSchema],
  totalPrice: { type: Number, required: true },
})
export const Cart = model<Icart>('Cart', cartSchema)
