import { Request, Response, Router } from 'express'
import { cancelOrder, createOrder, findOrders } from '../controllers/orders'
import authenticateUser from '../middlewares/authenticateUser'
import jwtSign from '../middlewares/jwtSign'
import jwtVerify from '../middlewares/jwtVerify'

const router: Router = Router()

router.get(
  '/',
  [jwtVerify, authenticateUser],
  async (req: Request, res: Response) => {
    try {
      const orders = await findOrders(req.headers.customeremail as string)
      orders ? res.send(orders) : res.sendStatus(404)
    } catch (error: any) {
      res.status(error.status).send(error.message)
    }
  }
)
router.post(
  '/',
  [jwtVerify, authenticateUser],
  async (req: Request, res: Response) => {
    try {
      const newOrder = await createOrder(req.body)
      newOrder ? res.send(newOrder) : res.sendStatus(400)
    } catch (error: any) {
      console.error(error)
      return res.status(error.status).send(error.message)
    }
  }
)
router.patch(
  '/',
  [jwtVerify, authenticateUser],
  async (req: Request, res: Response) => {
    try {
      const newOrder = await cancelOrder(req.body.orderId)
      newOrder ? res.send(newOrder) : res.sendStatus(400)
    } catch (error: any) {
      if (error.message.includes('Cast to ObjectId failed'))
        return res.status(404).send('order not found')
      res.sendStatus(500)
    }
  }
)

export default router
