import { genSalt, hash } from 'bcryptjs'
import { Request, Response, NextFunction } from 'express'

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.password && `${req.url.split('?')[0]}` === '/edit-profile') {
      return next()
    }
    const salt = await genSalt()
    const hashed = await hash(req.body.password, salt)
    res.locals.password = hashed
    return next()
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
}
