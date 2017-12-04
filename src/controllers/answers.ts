/* External dependencies */
import * as express from 'express';
import { Document } from 'mongoose';
import { Router, Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';

/* Internal dependencies */
import passportConfig from '../config/passport';
import { default as Answer, AnswerModel } from '../models/Answer';
import { default as Question, QuestionModel } from '../models/Question';
import { default as Session, SessionModel } from '../models/Session';
import { default as Score, ScoreModel } from '../models/Score';
import { CustomError, errorCreator } from '../utils/errorUtils';
import errorMessage from '../constants/errorMessage';

const router: Router = express.Router();

/**
 * @api {post} /v1/answers/:id/scores Create
 * @apiGroup Answer
 * @apiName Create score
 * @apiDescription Create score of answer
 *
 * @apiSuccessExample {json} Success-Response:
 *    {
 *      score: {
 *        id: 'number',
 *        value: 'number',
 *        interviewId: 'number',
 *        questionId: 'number',
 *        answerId: 'number',
 *        userId: 'number',
 *        updatedAt: 'number',
 *        createdAt: 'number'
 *      }
 *    }
 */
router.post('/:id/scores', passportConfig.isAuthenticated, (req: Request, res: Response, next: NextFunction): void => {
  Answer.findOne({ id: req.params.id }, (err, answer: AnswerModel): void => {
    if (err) {
      return next(err);
    }

    if (!answer) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        error: errorCreator(
          'id',
          errorMessage.NOT_EXISTED_ANSWER
        )
      })
      return null;
    }

    Question.findOne({ id: answer.questionId }, (err, question: QuestionModel): void => {
      if (err) {
        return next(err);
      }

      if (!question) {
        res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
          error: errorCreator(
            'questionId',
            errorMessage.NOT_EXISTED_QUESTION
          )
        });
        return null;
      }

      Session.findOne({ userId: req.user.id, interviewId: question.interviewId }, (err, session: SessionModel): void => {
        if (err) {
          return next(err);
        }

        if (!session || !session.isInterviewer()) {
          res.status(HttpStatus.UNAUTHORIZED).json({
            error: errorCreator(
              'sessionId',
              errorMessage.NOT_ALLOWED_CREATE_SCORE,
            )
          })
          return null;
        }

        Score.findOne({ answerId: answer.id, createdUserId: req.user.id }, (err, score: ScoreModel): void => {
          if (err) {
            return next(err);
          }

          const newScore = (() => {
            if (score) {
              score.value = req.body.value || 0;
              return score;
            }

            return new Score({
              value: req.body.value || 0,
              interviewId: question.interviewId,
              questionId: question.id,
              answerId: answer.id,
              userId: answer.userId,
              createdUserId: req.user.id,
            });
          })();

          newScore.save((err, savedScore: ScoreModel): void => {
            if (err) {
              return next(err);
            }

            res.status(HttpStatus.OK).json({ score: savedScore });
          });
        });
      });
    });
  });
});

export default router;
