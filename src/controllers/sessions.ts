/* External dependencies */
import * as express from 'express';
import { Document } from 'mongoose';
import { Router, Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';

/* Internal dependencies */
import passportConfig from '../config/passport';
import { default as Session, SessionModel } from '../models/Session';
import { default as User } from '../models/User';
import { CustomError, errorCreator } from '../utils/errorUtils';
import errorMessage from '../constants/errorMessage';
import sessionValidator from '../middlewares/validators/sessionValidator';

const router: Router = express.Router();

/**
 * @api {get} /v1/sessions Get
 * @apiGroup Session
 * @apiName Get sessions
 * @apiDescription Get sessions created by user
 *
 * @apiSuccessExample {json} Success-Response:
 *    {
 *        sessions: [{
 *            id: 'number',
 *            role: 'string',
 *            userId: 'number',
 *            interviewId: 'number',
 *            createdAt: 'number',
 *            updatedAt: 'number'
 *        }]
 *    }
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
 * @api {put} /v1/sessions Update
 * @apiGroup Session
 * @apiName Update session
 * @apiDescription Update session
 *
 * @apiSuccessExample {json} Success-Response:
 *    {
 *        session: {
 *            id: 'number',
 *            role: 'string',
 *            userId: 'number',
 *            interviewId: 'number',
 *            createdAt: 'number',
 *            updatedAt: 'number'
 *        }
 *    }
 */
router.put('/:id', passportConfig.isAuthenticated, sessionValidator, (req: Request, res: Response, next: NextFunction): void => {
  Session.findOne({ id: req.params.id }, (err, session: SessionModel): void => {
    if (err) {
      return next(err);
    }

    if (!session) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        error: errorCreator(
          'id',
          errorMessage.NOT_EXISTED_SESSION
        )
      })
      return null;
    }

    if (session.userId !== req.user.id) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        error: errorCreator(
          'userId',
          errorMessage.NOT_ALLOWED_UPDATE_SESSION,
        )
      })
      return null;
    }

    session.email = req.body.email;
    session.name = req.body.name;
    session.mobileNumber = req.body.mobileNumber;

    session.save((err, savedSession: SessionModel) => {
      if (err) {
        return next(err);
      }

      res.status(HttpStatus.OK).json({ session: savedSession });
    })
  })
});

export default router;
