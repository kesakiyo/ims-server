/* External dependencies */
import * as express from 'express';
import { Router, Request, Response, NextFunction } from 'express';
import { Document } from 'mongoose';
import * as HttpStatus from 'http-status-codes';
import * as passport from 'passport';
import { LocalStrategyInfo } from 'passport-local';

/* Internal dependencies */
import { default as User, UserModel } from '../models/User';
import passportConfig from '../config/passport';

const router: Router = express.Router();

/**
 * @api {post} /v1/users Create
 * @apiGroup User
 * @apiName Create user
 * @apiDescription Create user with email, password, passwordConfirm
 *
 * @apiSuccessExample {json} Success-Response:
 *    {
 *        id: 'number',
 *        email: 'string',
 *        createdAt: 'number',
 *        updatedAt: 'number'
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
      return null;
    }

    user.save((err): void => {
      if (err) {
        return next(err);
      }
      res.status(HttpStatus.OK).send('ok')
    })
  });
});

/**
 * @api {post} /v1/users Sign In
 * @apiGroup Users
 * @apiName Sign In
 * @apiDescription Sign In with email and password
 *
 * @apiSuccessExample {json} Success-Response:
 *    {
 *        id: 'number',
 *        email: 'string'
 *        createdAt: 'number',
 *        updatedAt: 'number'
 *    }
 */
router.post('/signin', (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', (err: Error, user: UserModel, info: LocalStrategyInfo) => {
    if (err) {
      return next(err);
    }

    // todo: user를 왜 못찾았는지에 대한 정확한 정보를 전달해 줄 필요가 있음.
    if (!user) {
      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
        error: 'Not found user',
      });
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      res.status(200).json(user);
    })
  })(req, res, next);
});

/**
 * @api {post} /v1/users Sign Out
 * @apiGroup Users
 * @apiName Sign Out
 * @apiDescription Sign out
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 * }
 */
router.delete('/signout', (req: Request, res: Response, next: NextFunction) => {
  req.logOut();
  res.status(HttpStatus.OK).send();
})

/**
 * @api {post} /v1/users/me Get Me
 * @apiGroup Users
 * @apiName Get me
 * @apiDescription Reuqest user to server, If you don't sign in, server sends error code.
 *
 * @apiSuccessExample {json} Success-Response:
 *    {
 *        id: 'number',
 *        email: 'string',
 *        createdAt: 'number',
 *        updatedAt: 'number'
 *    }
 */
router.get('/me', passportConfig.isAuthenticated, (req: Request, res: Response): void => {
  res.status(HttpStatus.OK).json(req.user.toJSON());
});

export default router;