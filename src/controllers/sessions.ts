/* External dependencies */
import * as express from 'express';
import { Document } from 'mongoose';
import { Router, Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';

/* Internal dependencies */
import passportConfig from '../config/passport';
import { default as Session, SessionModel } from '../models/Session';
import { default as User } from '../models/User';

const router: Router = express.Router();

/**
 * @api {get} /v1/sessions Get
 * @apiGroup Session
 * @apiName Get sessions
 * @apiDescription Get sessions created by user
 *
 * @apiSuccessExample {json} Success-Response:
 *    [
 *        {
 *            id: 'number',
 *            role: 'string',
 *            user: 'User',
 *            interview: 'Interview',
 *            createdAt: 'number',
 *            updatedAt: 'number'
 *        }
 *    ]
 */
router.get('/', passportConfig.isAuthenticated, (req: Request, res: Response, next: NextFunction): void => {
  Session
    .find({
      userId: {
        $in: req.user.id,
      }
    })
    .sort({ cratedAt: -1 })
    .exec((err: Error, result: SessionModel[]) => {
      if (err) {
        return next(err);
      }

      res.status(HttpStatus.OK).json(result);
    })
});

/**
 * @api {post} /v1/sessions Create
 * @apiGroup Session
 * @apiName Create session
 * @apiDescription Create session with role
 *
 * @apiSuccessExample {json} Success-Response:
 *    {
 *        id: 'number',
 *        role: 'string',
 *        user: 'User',
 *        interview: 'Interview',
 *        createdAt: 'number',
 *        updatedAt: 'number'
 *    }
 */
router.post('/', passportConfig.isAuthenticated, (req: Request, res: Response, next: NextFunction): void => {

  const session: Document = new Session({
    userId: req.user.id,
    role: req.body.role,
  })

  Session.findOne({ userId: req.user.id }, (err, existingUser): void => {
    if (err) {
      return next(err);
    }

    if (existingUser) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({ message: "Session with that user id already exists." });
      return null;
    }

    session.save((err: Error, result: SessionModel): void => {
      if (err) {
        return next(err);
      }

      res.status(HttpStatus.OK).json(result);
    })
  })
});

export default router;