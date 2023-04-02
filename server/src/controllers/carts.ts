import { readFile } from 'fs/promises'
import { Document } from 'mongoose'
import { Icart, IcartData, IcartProduct } from '../interfaces/cart'
import { Cart } from '../models/cart'
import { findProductbyId } from './products'
import { findUser } from './users'
import { fileMatcher } from '../utils'
import { Buffer } from 'buffer'
export const createCart = async (
  doc: IcartData
): Promise<Document<unknown, any, Icart> | null | Icart> => {
  const [customer] = await findUser(doc.customerEmail)
  const [product]: any = await findProductbyId(doc.productId)
  const cartProduct: IcartProduct = {
    _id: product._id,
    quantity: doc.quantity,
    unitPrice: product.price,
    totalProductPrice: product.price * doc.quantity,
  }
  const cart: Icart = {
    customer: customer.email,
    products: [cartProduct],
    creationDate: new Date().toLocaleString(),
    totalPrice: cartProduct.totalProductPrice,
  }
  const newCart = new Cart(cart)
  await newCart.save()
  const updatedCart = await findCart(newCart.customer)
  return updatedCart
}
export const updateCart = async (
  doc: IcartData,
  remove?: boolean
): Promise<Document<unknown, any, Icart> | null | Icart | string> => {
  const cartExists = await findCart(doc.customerEmail)
  if (!cartExists) return await createCart(doc)
  const [newProduct]: any = await findProductbyId(doc.productId)
  if (!newProduct) throw { status: 404, message: 'Product not found' }
  let productUpdated = false
  const updatedProducts = cartExists.products
    .map((product: IcartProduct) => {
      if (product._id.toString() === doc.productId) {
        switch (true) {
          case remove:
            productUpdated = true
            return null
          case doc.update:
            product.totalProductPrice =
              (product.totalProductPrice / product.quantity) * doc.quantity
            product.quantity = doc.quantity
            productUpdated = true
            return product
          default:
            product.totalProductPrice =
              (product.totalProductPrice / product.quantity) *
              (product.quantity + doc.quantity)
            product.quantity += doc.quantity
            productUpdated = true
            return product
        }
      }
      return product
    })
    .filter((product) => product !== null) as IcartProduct[]
  if (!productUpdated && !remove) {
    updatedProducts.push({
      _id: newProduct._id,
      quantity: doc.quantity,
      unitPrice: newProduct.price,
      totalProductPrice: newProduct.price * doc.quantity,
    })
  }
  if (!updatedProducts.length) {
    await Cart.deleteOne(cartExists)
    return null
  }
  const updatedCart: Omit<Icart, 'creationDate'> = {
    customer: cartExists.customer,
    products: updatedProducts,
    totalPrice: updatedProducts.reduce(
      (total, product) => total + product.totalProductPrice,
      0
    ),
  }
  const cart = await Cart.findOneAndUpdate(
    { customer: doc.customerEmail },
    { $set: updatedCart },
    { upsert: true, new: true }
  )
  const newCart = await findCart(cart.customer)
  return newCart
}

export const findCart = async (email: string): Promise<Icart> => {
  const [cart] = await Cart.find({ customer: email })
  const productsDataArray: IcartProduct[] = []
  if (cart) {
    for (const product of cart.products) {
      const [productData] = await findProductbyId(product._id.toString())
      const image = await readFile(
        `./images/${await fileMatcher(productData.imageId, './images')}`
      )
      productsDataArray.push({
        name: productData.name,
        unitPrice: productData.price,
        quantity: product.quantity,
        totalProductPrice: product.totalProductPrice,
        imageData: `data:image/jpeg;base64, ${Buffer.from(image).toString(
          'base64'
        )}`,
        _id: product._id,
      })
    }
    const newCart: Icart = {
      customer: cart.customer,
      creationDate: cart.creationDate,
      products: productsDataArray,
      totalPrice: cart.totalPrice,
    }
    return newCart
  }
  return cart
}
