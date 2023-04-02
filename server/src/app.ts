import 'dotenv/config'
import express, { Application, NextFunction, Request, Response } from 'express'
import mongoose, { connect } from 'mongoose'
import cors from 'cors'
import swaggerJSDoc from 'swagger-jsdoc'
import * as OpenApiValidator from 'express-openapi-validator'
import { serve, setup } from 'swagger-ui-express'
import { options } from './swagger/swagger-options'
import user from './routes/users'
import product from './routes/products'
import cart from './routes/carts'
import order from './routes/orders'

mongoose.set('strictQuery', false)
const mongoUrl = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.DB_NAME}?authSource=admin`

connect(mongoUrl)
  .then(() => console.log('successfully connected to mongodb'))
  .catch((error) => console.error(error))
const specs = swaggerJSDoc(options)
const app: Application = express()

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use('/api-docs', serve, setup(specs))
app.use(
  OpenApiValidator.middleware({
    apiSpec: `${__dirname}/swagger/open-api.yaml`,
    validateRequests: true,
    validateResponses: true,
  })
)
app.use('/user', user)
app.use('/cart', cart)
app.use('/products', product)
app.use('/order', order)

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  switch (true) {
    case err.status === 401:
      res.status(err.status).set('content-type', 'text/plain').send(err.message)
      break
    case err.status === 403:
      res.status(err.status).set('content-type', 'text/plain').send(err.message)
      break
    case err.status === 404:
      res
        .status(err.status)
        .set('content-type', 'text/plain')
        .send(`path ${err.path} ${err.message}`)
      break
    case err.status === 500:
      res.status(err.status).set('content-type', 'text/plain').send(err.message)
      break
    case err.message.includes('must have required property'):
      res
        .status(err.status)
        .set('content-type', 'text/plain')
        .send(err.message.split('/').slice(-1)[0])
      break
    case err.message.includes('must be number'):
      res
        .status(err.status)
        .set('content-type', 'text/plain')
        .send(err.message.split('/').slice(-1)[0])
      break
    case err.message.includes('must match format'):
      res
        .status(err.status)
        .set('content-type', 'text/plain')
        .send(err.message.split('/').slice(-1)[0])
      break
    case err.message.includes('must be <= 100') ||
      err.message.includes('must be >= 1'):
      res
        .status(err.status)
        .set('content-type', 'text/plain')
        .send('must be value between 1 and 100')
      break
    default:
      next(err)
      break
  }
})
app.listen(process.env.APP_PORT, () =>
  console.log(`server is listening on port ${process.env.APP_PORT}`)
)
