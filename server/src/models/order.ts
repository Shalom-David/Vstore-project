import { model, Schema } from 'mongoose'
import { Iorder } from '../interfaces/order'
import { cartProductSchema } from './cart'

const orderSchema = new Schema<Iorder>({
  customerEmail: { type: String, required: true },
  customerCart: {
    products: [
      {
        type: cartProductSchema,
        required: true,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  billingAddress: {
    city: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
  },
  deliveryDate: { type: String, required: true },
  orderDate: {
    type: String,
    required: true,
    default: new Date().toLocaleString(),
  },
  cardEndsWith: { type: Number, required: true },
  status: {
    type: String,
    enum: ['complete', 'shipping', 'rejected', 'cancelled'],
    required: true,
  },
})

export const Order = model<Iorder>('Order', orderSchema)
