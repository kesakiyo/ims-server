/* External dependencies */
import * as express from 'express';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Router, Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';

/* Internal dependencies */
import passportConfig from '../config/passport';
import { default as Interview, InterviewModel } from '../models/Interview';
import { default as Question, QuestionModel } from '../models/Question';
import { default as Session, SessionModel } from '../models/Session';
import { default as User } from '../models/User';
import sessionRole from '../constants/sessionRole';

const router: Router = express.Router();

/**
 * @api {get} /v1/interviews Get
 * @apiGroup Interview
 * @apiName Get interviews
 * @apiDescription Get all interviews
 *
 * @apiSuccessExample {json} Success-Response:
 *    {
 *        interviews: [
 *            id: number,
 *            title: string,
 *            description: string,
 *            startTime: number,
 *            endTime: number,
 *            createdAt: number,
 *            updatedAt: number,
 *        ],
 *        sessions: [
 *            id: 'number',
 *            role: 'string',
 *            userId: 'number',
 *            interviewId: 'number',
 *            createdAt: 'number',
 *            updatedAt: 'number'
 *        ]
 *    }
 */
router.get('/', (req: Request, res: Response, next: NextFunction): void => {
  Interview
    .find()
    .sort({ cratedAt: -1 })
    .exec((err: Error, interviews: InterviewModel[]) => {
      if (err) {
        return next(err);
      }

      Session
        .find({
          interviewId: {
            $in: interviews.map(interview => interview.id),
          }
        })
        .exec((err: Error, sessions: SessionModel[]) => {
          if (err) {
            return next(err);
          }

          res.status(HttpStatus.OK).json({
            interviews,
            sessions,
          });
        })
    })
});

/**
 * @api {post} /v1/interviews Create
 * @apiGroup Interview
 * @apiName Create interview
 * @apiDescription Create interview with options
 *
 * @apiSuccessExample {json} Success-Response:
 *    {
 *        interview: {
 *            id: number,
 *            title: string,
 *            description: string,
 *            startTime: number,
 *            endTime: number,
 *            createdAt: number,
 *            updatedAt: number,
 *        },
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
router.post('/', passportConfig.isAuthenticated, (req: Request, res: Response, next: NextFunction): void => {

  const interview: Document = new Interview({
    title: req.body.title,
    description: req.body.description,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
  })

  interview.save((err: Error, savedInterview: InterviewModel): void => {
    if (err) {
      return next(err);
    }

    const session: Document = new Session({
      userId: req.user.id,
      role: sessionRole.MASTER,
      interviewId: savedInterview.id,
    })

    session.save((err: Error, savedSession: SessionModel): void => {
      if (err) {
        return next(err);
      }

      res.status(HttpStatus.OK).json({
        interview: savedInterview,
        session: savedSession,
      })
    })
  })
});

router.post('/:id/questions', passportConfig.isAuthenticated, (req: Request, res: Response, next: NextFunction): void => {
  Session.findOne({ userId: req.user.id, interviewId: req.params.id }, (err, session: SessionModel): void => {
    if (err) {
      return next(err);
    }

    if (!session) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).send('세션을 찾을 수 없습니다.')
      return null;
    }

    if (!session.isMaster()) {
      res.status(HttpStatus.UNAUTHORIZED).send('권한이 없습니다. 마스터만 질문을 추가할 수 있습니다.');
      return null;
    }

    const { title, description, type, order } = req.body

    const question: Document = new Question({
      title,
      description,
      type,
      interviewId: session.interviewId,
    })

    question.save((err: Error, savedQuestion: QuestionModel): void => {
      if (err) {
        return next(err);
      }

      res.status(HttpStatus.OK).json(savedQuestion);
    })
  })
})

export default router;