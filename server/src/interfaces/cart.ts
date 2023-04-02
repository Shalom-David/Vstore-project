import mongoose from 'mongoose'

export interface Icart {
  customer: string
  creationDate: string
  products: IcartProduct[]
  totalPrice: number
}

export interface IcartProduct {
  _id: mongoose.Schema.Types.ObjectId
  quantity: number
  unitPrice: number
  totalProductPrice: number
  name?: string
  imageData?: string
}

export interface IcartData {
  customerEmail: string
  productId: string
  quantity: number
  update?: boolean
}
