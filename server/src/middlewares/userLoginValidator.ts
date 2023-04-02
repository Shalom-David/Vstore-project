import { Request, Response, NextFunction } from 'express'
import { compare } from 'bcryptjs'
import { findUser } from '../controllers/users'

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [userExists] = await findUser(req.body.email)
    let isValidPassword: boolean = false
    if (userExists) {
      res.locals.userRole = userExists.role
      res.locals.email = userExists.email
      isValidPassword = await compare(req.body.password, userExists.password)
    }
    if (!isValidPassword) {
      return res
        .status(400)
        .send('incorrect username or password')
    }
    next()
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
}
