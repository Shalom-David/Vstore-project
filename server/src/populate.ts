import 'dotenv/config'
import { readFile, writeFile } from 'fs/promises'
import mongoose, { connect } from 'mongoose'
import { Iproduct } from './interfaces/product'
import path from 'path'
import { findProducts } from './controllers/products'
import { Product } from './models/product'

mongoose.set('strictQuery', false)
const mongoUrl = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.DB_NAME}?authSource=admin`

connect(mongoUrl)
  .then(() => {
    populateDatabase()
    console.log('Successfuly Populated Database')
  })
  .catch((error) => console.error(error))

const readProductsJson = async (filePath: string): Promise<Iproduct[]> => {
  const jsonData = await readFile(filePath, 'utf-8')
  const data = JSON.parse(jsonData)
  return data
}

const populateDatabase = async (): Promise<void> => {
  const products = await readProductsJson(
    `${path.join(__dirname, '..')}/lib/products.json`
  )
  const productsList = await findProducts()
  for (const product of products) {
    const image = await readFile(
      `${path.join(__dirname, '..')}/lib/images/${product.imageId}`
    )
    const [productExists] = productsList.filter(
      (exitingProduct) => exitingProduct.name === product.name
    )
    if (productExists) {
      throw Error(`product with name ${product.name} already exists`)
    }
    const timestamp = Date.now()
    product.imageId = timestamp.toString()
    const newProduct = new Product(product)
    newProduct.save()
    await writeFile(`./images/${product.imageId}.jpg`, image)
  }
}
