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
import { default as Answer, AnswerModel } from '../models/Answer';
import { default as User } from '../models/User';
import sessionRole from '../constants/sessionRole';
import { CustomError, errorCreator } from '../utils/errorUtils';
import errorMessage from '../constants/errorMessage';
import questionValidator from '../middlewares/validators/questionValidator';

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
        });
    });
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
      });
    });
  });
});

/**
 * @api {put} /v1/interviews/:id/join join to the interview
 * @apiGroup Interview
 * @apiName join interview
 * @apiDescription join to the interview
 *
 * @apiSuccessExample {json} Success-Response:
 *    {
 *        interview: {
 *          id: number,
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
 *            userId: 'User',
 *            interview: 'Interview',
 *            createdAt: 'number',
 *            updatedAt: 'number'
 *        }
 *    }
 */
router.put('/:id/join', passportConfig.isAuthenticated, (req: Request, res: Response, next: NextFunction): void => {
  Interview.findOne({ id: req.params.id }, (err, interview: InterviewModel): void => {
    if (err) {
      return next(err);
    }

    if (!interview) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        error: errorCreator(
          'id',
          errorMessage.NOT_EXISTED_INTERVIEW,
        )
      });
      return null;
    }

    Session.findOne({ interviewId: interview.id, userId: req.user.id }, (err, session: SessionModel): void => {
      if (err) {
        return next(err);
      }

      if (session) {
        if (!session.isInterviewee()) {
          res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
            error: errorCreator(
              'role',
              errorMessage.NOT_ALLOWED_JOIN_TO_INTERVIEW,
            )
          });
          return null;
        }

        res.status(HttpStatus.OK).json({ interview, session });
        return null;
      }

      const newSession: Document = new Session({
        email: req.user.email,
        role: sessionRole.INTERVIEWEE,
        interviewId: interview.id,
        userId: req.user.id,
      });

      newSession.save((err: Error, savedSession: SessionModel): void => {
        if (err) {
          return next(err);
        }

        res.status(HttpStatus.OK).json({
          interview,
          session: savedSession,
        });

        return null;
      })
    })
  })
})

/**
 * @api {get} /v1/interviews/:id/sessions get sessions of interview
 * @apiGroup Interview
 * @apiName get sessions of interview
 * @apiDescription get sessions of interview
 *
 * @apiSuccessExample {json} Success-Response:
 *    {
 *        sessions: [
 *            {
 *                id: 'number',
 *                role: 'string',
 *                userId: 'User',
 *                interview: 'Interview',
 *                createdAt: 'number',
 *                updatedAt: 'number'
 *            }
 *        ]
 *    }
 */
router.get('/:id/sessions', passportConfig.isAuthenticated, (req: Request, res: Response, next: NextFunction): void => {
  Session.findOne({ userId: req.user.id, interviewId: req.params.id }, (err, existedSession: SessionModel): void => {
    if (!existedSession || existedSession.isInterviewee()) {
      res.status(HttpStatus.UNAUTHORIZED).send('권한이 없습니다.');
      return null;
    }

    Session
      .find({ interviewId: req.params.id })
      .exec((err: Error, sessions: SessionModel[]) => {
        if (err) {
          return next(err);
        }

        res.status(HttpStatus.OK).json({ sessions })
      });
  });
})

/**
 * @api {post} /v1/interviews/:id/questions create question of interview
 * @apiGroup Interview
 * @apiName create question
 * @apiDescription Create question of interview
 *
 * @apiSuccessExample {json} Success-Response:
 *    {
 *        question: {
 *            id: 'number',
 *            title: 'string',
 *            description: 'string',
 *            type: 'string',
 *            limit: 'number',
 *            interviewId: 'number',
 *            createdAt: 'number',
 *            updatedAt: 'number'
 *        }
 *    }
 */
router.post('/:id/questions', passportConfig.isAuthenticated, questionValidator, (req: Request, res: Response, next: NextFunction): void => {
  Session.findOne({ userId: req.user.id, interviewId: req.params.id }, (err, session: SessionModel): void => {
    if (err) {
      return next(err);
    }

    if (!session) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        error: errorCreator(
          'sessionId',
          errorMessage.NOT_EXISTED_SESSION
        )
      })
      return null;
    }

    if (!session.isMaster()) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: errorCreator(
          'role',
          errorMessage.NOT_ALLOWED_UPSERT_QUESTION
        )
      })
      return null;
    }

    const { title, description, type, limit } = req.body

    const question: Document = new Question({
      title,
      description,
      type,
      limit,
      interviewId: session.interviewId,
    })

    question.save((err: Error, savedQuestion: QuestionModel): void => {
      if (err) {
        return next(err);
      }

      res.status(HttpStatus.OK).json({ question: savedQuestion });
    })
  })
})

/**
 * @api {get} /v1/interviews/:id/questions get questions of interview
 * @apiGroup Interview
 * @apiName get questions
 * @apiDescription get questions of interview
 *
 * @apiSuccessExample {json} Success-Response:
 *    {
 *        questions: [{
 *            id: 'number',
 *            title: 'string',
 *            description: 'string',
 *            type: 'string',
 *            limit: 'number',
 *            interviewId: 'number',
 *            createdAt: 'number',
 *            updatedAt: 'number'
 *        }],
 *        answers: [{
 *            id: number,
 *            text: string,
 *            file: string,
 *            userId: number,
 *            questionId: number,
 *            interviewId: number,
 *            createdAt: number,
 *            updatedAt: number,
 *        }]
 *    }
 */
router.get('/:id/questions', passportConfig.isAuthenticated, (req: Request, res: Response, next: NextFunction): void => {
  Session.findOne({ interviewId: req.params.id, userId: req.user.id }, (err, session: SessionModel): void => {
    if (err) {
      return next(err);
    }

    if (!session) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: errorCreator(
          'role',
          errorMessage.NOT_ALLOWED_GET_QUESTIONS
        )
      })
      return null;
    }

    Question
      .find({ interviewId: req.params.id })
      .sort({ createdAt: 1 })
      .exec((err, questions: QuestionModel[]): void => {
        if (err) {
          return next(err);
        }

        Answer
          .find({ userId: req.user.id, interviewId: req.params.id })
          .exec((err, answers: AnswerModel[]): void => {
            if (err) {
              return next(err);
            }

            res.status(HttpStatus.OK).json({ questions, answers });
          })
      })
  })
});

export default router;