import { Request, Response, NextFunction } from 'express'

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [user] = res.locals.user

    if (user.role === 'admin' || user.role === 'user') {
      return next()
    }
    res.status(403).send('you do not have permissions')
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
}
