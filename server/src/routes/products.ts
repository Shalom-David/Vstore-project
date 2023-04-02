import { Request, Response, Router } from 'express'
import {
  createProduct,
  deleteProduct,
  findProductByCategory,
  findProducts,
  paginatedProducts,
  updateProduct,
} from '../controllers/products'
import authenticateAdmin from '../middlewares/authenticateAdmin'
import jwtVerify from '../middlewares/jwtVerify'

const router: Router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, page, search } = req.query

    if (!category && !page) {
      const products = await paginatedProducts()
      return products ? res.send(products) : res.sendStatus(404)
    }
    if (category) {
      const products = await findProductByCategory(
        category as string,
        +(page as string),
        16,
        search as string
      )
      return products ? res.send(products) : res.sendStatus(404)
    }
    const products = await paginatedProducts(
      +(page as string),
      16,
      search as string
    )
    products ? res.send(products) : res.sendStatus(404)
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
})

router.post(
  '/',
  [jwtVerify, authenticateAdmin],
  async (req: Request, res: Response) => {
    try {
      const newProduct = await createProduct(
        req.body,
        req.files as unknown as Express.Multer.File[]
      )
      newProduct ? res.send(newProduct) : res.sendStatus(400)
    } catch (error: any) {
      switch (true) {
        case error.message.includes('already exists'):
          res.status(400).send(error.message)
          break
        case error.message === 'file is too large':
          res.status(400).send(error.message)
          break
        case error.message === 'invalid file type':
          res.status(400).send(error.message)
          break
        case error.message.includes('Cast to Number failed'):
          res.status(400).send('price must be a number')
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
  [jwtVerify, authenticateAdmin],
  async (req: Request, res: Response) => {
    try {
      const updatedProduct = await updateProduct(
        req.body,
        req.files as unknown as Express.Multer.File[]
      )
      updatedProduct ? res.send(updatedProduct) : res.sendStatus(400)
    } catch (error: any) {
      switch (true) {
        case error.message.includes(req.body.name):
          res.status(400).send(error.message)
          break
        case error.message === 'file is too large':
          res.status(400).send(error.message)
          break
        case error.message === 'invalid file type':
          res.status(400).send(error.message)
          break
        case error.message.includes('Cast to Number failed'):
          res.status(400).send('price must be a number')
          break
        default:
          res.sendStatus(500)
          break
      }
    }
  }
)
// ### delete function implemented but not used.
//     to enable delete products un-comment the route.
// router.delete('/:id',  [jwtVerify, authenticateAdmin], async (req: Request, res: Response) => {
//   try {
//     const isDeleted = await deleteProduct(req.params.id)
//     isDeleted ? res.send(isDeleted) : res.sendStatus(400)
//   } catch (error: any) {
//     console.error(error)
//     res.status(error.status).send(error.message)
//   }
// })

export default router
