/* External dependencies */
import * as express from 'express';
import { Router, Request, Response, NextFunction } from 'express';
import { Document } from 'mongoose'
import * as HttpStatus from 'http-status-codes'

/* Internal dependencies */
import User from '../models/User'

const router: Router = express.Router();

/**
 * @api {post} /v1/users Create
 * @apiGroup User
 * @apiName Create user
 * @apiDescription Create user with email, password, passwordConfirm
 *
 * @apiSuccessExample {json} Success-Response:
 *    {
 *        email: 'string'
 *    }
 */
router.post('/', (req: Request, res: Response, next: NextFunction): void => {
  const user: Document = new User({
    email: req.body.email,
    password: req.body.password,
  })

  User.findOne({ email: req.body.email }, (err, existingUser): void => {
    if (err) {
      return next(err);
    }

    if (existingUser) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({ message: "Account with that email address already exists." });
    }

    user.save((err): void => {
      if (err) {
        return next(err);
      }
      res.status(HttpStatus.OK).send(user.toJSON())
    })
  })
});

export default router;