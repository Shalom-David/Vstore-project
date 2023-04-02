import { model, Schema } from 'mongoose'
import { Iproduct } from '../interfaces/product'

const productSchema = new Schema<Iproduct>({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  imageId: { type: String, required: true },
  description: { type: String, maxLength: 999, required: true },
})

export const Product = model<Iproduct>('Product', productSchema)
