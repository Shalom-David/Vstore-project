import { Document } from 'mongoose'
import { Iorder } from '../interfaces/order'
import { IcartProduct } from '../interfaces/cart'
import { Order } from '../models/order'
import { findCart } from './carts'
import { Cart } from '../models/cart'
import { findProductbyId } from './products'
import { fileMatcher } from '../utils'
import { readFile } from 'fs/promises'
import { Buffer } from 'buffer'
export const createOrder = async (
  doc: any
): Promise<Document<unknown, any, Iorder> | Iorder> => {
  const cart = await findCart(doc.customerEmail)

  if (!cart)
    throw {
      status: 400,
      message: 'cart is empty',
    }
  const dateParts = doc.deliveryDate.split('/')
  const formatedDate = new Date(
    Date.UTC(
      Number(dateParts[2]),
      Number(dateParts[1]) - 1,
      Number(dateParts[0])
    )
  )
  if (formatedDate.getTime() < new Date().getTime()) {
    throw { status: 400, message: 'date cannot be before today' }
  }
  const { products, totalPrice } = cart
  const order: Iorder = {
    customerEmail: doc.customerEmail,
    customerCart: {
      products: products,
      totalPrice: totalPrice,
    },
    billingAddress: doc.billingAddress,
    deliveryDate: doc.deliveryDate,
    orderDate: new Date().toLocaleDateString(),
    cardEndsWith: parseInt(doc.creditCard.split(' ')[3]),
    status: /\b(?:\d[ -]*?){16}\b/.test(doc.creditCard)
      ? 'shipping'
      : 'rejected',
  }
  const newOrder = new Order(order)
  await Cart.deleteOne(cart)
  await newOrder.save()
  order.customerCart.products = order.customerCart.products.map((product) => {
    const { imageData, ...orderDetail } = product
    return orderDetail
  })
  order._id = newOrder._id.toString()
  return order
}
export const findOrders = async (email?: string): Promise<Iorder[] | any> => {
  const orders = await Order.find(email ? { customerEmail: email } : {})
  // if (!email) {
  //   return orders
  // }
  for (const order of orders) {
    const dateParts = order.deliveryDate.split('/')
    const formatedDate = new Date(
      Date.UTC(
        Number(dateParts[2]),
        Number(dateParts[1]) - 1,
        Number(dateParts[0])
      )
    )
    if (formatedDate.getTime() < new Date().getTime()) {
      await Order.findOneAndUpdate(
        { _id: order._id },
        { $set: { status: 'complete' } },
        { upsert: true, new: true }
      )
    }
  }
  const updatedOrders: Iorder[] = []
  for (const order of orders) {
    let productsDataArray: (IcartProduct & { description: string })[] = []
    for (const product of order.customerCart.products) {
      const [productData] = await findProductbyId(product._id.toString())
      const image = await readFile(
        `./images/${await fileMatcher(productData.imageId, './images')}`
      )
      productsDataArray.push({
        name: productData.name,
        quantity: product.quantity,
        unitPrice: productData.price,
        totalProductPrice: product.totalProductPrice,
        imageData: `data:image/jpeg;base64, ${Buffer.from(image).toString(
          'base64'
        )}`,
        _id: product._id,
        description: productData.description,
      })
    }

    const updatedOrder = {
      ...order.toObject(),
      customerCart: { ...order.customerCart, products: productsDataArray },
    }
    updatedOrders.push(updatedOrder)
  }

  return updatedOrders
}

export const findOrder = async (id: string): Promise<Iorder | null> => {
  return await Order.findById(id)
}

export const cancelOrder = async (orderId: string): Promise<Iorder | void> => {
  const order = await Order.findById(orderId)
  if (order) {
    const dateParts = order.deliveryDate.split('/')
    const formatedDate = new Date(
      Date.UTC(
        Number(dateParts[2]),
        Number(dateParts[1]) - 1,
        Number(dateParts[0])
      )
    )
    if (
      formatedDate.getTime() > new Date().getTime() &&
      order.status === 'shipping'
    ) {
      return await Order.findOneAndUpdate(
        { _id: orderId },
        { $set: { status: 'cancelled' } },
        { upsert: true, new: true }
      )
    }
  }
}
