import { Request, Response, NextFunction } from 'express'
import jwt, { VerifyErrors } from 'jsonwebtoken'
import { findUser } from '../controllers/users'

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.sendStatus(401)
    }
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) {
      return res.sendStatus(401)
    }
    if (!process.env.ACCESS_TOKEN_SECRET) {
      return res.sendStatus(500)
    }

    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err: VerifyErrors | null, decoded: any) => {
        if (err) {
          return res.sendStatus(403)
        }
        const { email } = decoded

        const user = await findUser(email)

        if (!user) {
          return res.sendStatus(403)
        }
        res.locals.user = user
        next()
      }
    )
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
}
