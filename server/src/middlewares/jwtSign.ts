import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!process.env.ACCESS_TOKEN_SECRET) {
      return res.sendStatus(500)
    }
    let email: string

    res.locals.user ? (email = res.locals.user.email) : ({ email } = req.body)

    jwt.sign(
      { email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '2h',
      },
      (err: Error | null, accessToken: string | undefined) => {
        if (err) {
          return res.sendStatus(500)
        }

        res.locals.accessToken = accessToken
        next()
      }
    )
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
}
