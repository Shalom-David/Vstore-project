import { Request, Response, Router } from 'express'
import { findCart, updateCart } from '../controllers/carts'
import authenticateUser from '../middlewares/authenticateUser'
import jwtSign from '../middlewares/jwtSign'
import jwtVerify from '../middlewares/jwtVerify'

const router: Router = Router()
router.post(
  '/',
  [jwtVerify, authenticateUser],
  async (req: Request, res: Response) => {
    try {
      const newCart = await updateCart(req.body)

      newCart ? res.send(newCart) : res.sendStatus(400)
    } catch (error: any) {
      console.error(error.message)
      switch (true) {
        case error.message.includes('Cannot read properties of undefined'):
          res.status(400).send('invalid email address')
          break
        case error.message.includes('Cast to ObjectId failed'):
          res.status(400).send('invalid product')
          break
        case error.message === 'Product not found':
          res.status(error.status).send(error.message)
          break
        default:
          res.sendStatus(500)
          break
      }
    }
  }
)
router.patch(
  '/',
  [jwtVerify, authenticateUser],
  async (req: Request, res: Response) => {
    try {
      const newCart = await updateCart(req.body, true)
      newCart ? res.send(newCart) : res.send(null)
    } catch (error: any) {
      switch (true) {
        case error.message.includes('Cannot read properties of undefined'):
          res.status(400).send('invalid email address')
          break
        case error.message.includes('Cast to ObjectId failed'):
          res.status(400).send('invalid product')
          break
        default:
          res.sendStatus(500)
          break
      }
    }
  }
)

router.get(
  '/',
  [jwtVerify, authenticateUser],
  async (req: Request, res: Response) => {
    try {
      const cart = await findCart(req.headers.customeremail as string)

      cart ? res.send(cart) : res.send(null)
    } catch (error: any) {
      res.sendStatus(500)
    }
  }
)

export default router
