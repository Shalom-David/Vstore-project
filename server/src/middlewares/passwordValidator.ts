import { NextFunction, Request, Response } from 'express'
import PasswordValidator from 'password-validator'

const schema: PasswordValidator = new PasswordValidator()

schema
  .is()
  .min(8)
  .is()
  .max(16)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits(1)
  .has()
  .not()
  .spaces()

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.password && req.url === '/edit-profile') {
      return next()
    }
    const errors = schema.validate(req.body.password, {
      details: true,
    }) as any[]
    if (!errors.length) {
      next()
    } else {
      return res.status(400).send({ errors })
    }
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
}
