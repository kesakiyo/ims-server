/* External dependencies */
import * as express from 'express';
import { Document } from 'mongoose';
import { Router, Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';

/* Internal dependencies */
import passportConfig from '../config/passport';
import { default as Question, QuestionModel } from '../models/Question';
import { default as Session, SessionModel } from '../models/Session';
import { default as Answer, AnswerModel } from '../models/Answer';
import { CustomError, errorCreator } from '../utils/errorUtils';
import errorMessage from '../constants/errorMessage';

const router: Router = express.Router();

/**
 * @api {post} /v1/questions/:id/answers create answer of question
 * @apiGroup Question
 * @apiName Create answer
 * @apiDescription create answer of question
 *
 * @apiSuccessExample {json} Success-Response:
 *    {
 *        answer: {
 *            id: number,
 *            text: string,
 *            file: string,
 *            userId: number,
 *            questionId: number,
 *            createdAt: number,
 *            updatedAt: number,
 *        }
 *    }
 */
router.post('/:id/answers', passportConfig.isAuthenticated, (req: Request, res: Response, next: NextFunction): void => {
  Question.findOne({ id: req.params.id }, (err, qusetion: QuestionModel): void => {
    if (err) {
      return next(err);
    }

    if (!qusetion) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        error: errorCreator(
          'questionId',
          errorMessage.NOT_EXISTED_QUESTION,
        )
      });
      return null;
    }

    Session.findOne({ userId: req.user.id, interviewId: qusetion.interviewId }, (err, session: SessionModel): void => {
      if (err) {
        return next(err);
      }

      if (!session || !session.isInterviewee()) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          error: errorCreator(
            'role',
            errorMessage.NOT_ALLOWED_CREATE_ANSWER
          )
        });
        return null;
      }

      // toto: Question Type에 따라 S3에 저장하는 로직 추가
      if (qusetion.isTextType()) {

        Answer.findOne({ userId: req.user.id, questionId: qusetion.id }, (err, answer: AnswerModel): void => {
          if (err) {
            return next(err);
          }

          const newAnswer: Document = (() => {
            if (answer) {
              answer.text = req.body.text;
              return answer;
            }
            return new Answer({
              userId: req.user.id,
              questionId: qusetion.id,
              text: req.body.text,
            })
          })();

          newAnswer.save((err, savedAnswer: AnswerModel): void => {
            if (err) {
              return next(err);
            }

            res.status(HttpStatus.OK).json({ answer: savedAnswer });
            return null;
          });
        });
      } else if (qusetion.isFileType()) {
        res.status(HttpStatus.UNPROCESSABLE_ENTITY).send('아직 준비가 안됐어요....ㅜㅜ');
      }
    });
  })
});

export default router;