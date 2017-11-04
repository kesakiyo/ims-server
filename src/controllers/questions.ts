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

const router: Router = express.Router();

/**
 * @api {get} /v1/test/ping Ping
 * @apiGroup Test
 * @apiName Ping
 *
 * @apiSuccessExample {String} Success-Response:
 *    pong
 */
router.post('/:id/answers', passportConfig.isAuthenticated, (req: Request, res: Response, next: NextFunction): void => {
  Question.findOne({ id: req.params.id }, (err, qusetion: QuestionModel): void => {
    if (err) {
      return next(err);
    }

    if (!qusetion) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).send('존재하지 않는 qusetion 아이디 입니다.');
      return null;
    }
    
    Session.findOne({ userId: req.user.id, interviewId: qusetion.interviewId }, (err, session: SessionModel): void => {
      if (err) {
        return next(err);
      }

      if (!session || !session.isInterviewee()) {
        res.status(HttpStatus.UNAUTHORIZED).send('interviewee만 답변을 저장할 수 있습니다.');
        return null;
      }

      // toto: Question Type에 따라 S3에 저장하는 로직 추가
      const answer: Document = new Answer({
        userId: req.user.id,
        questionId: qusetion.id,
        text: req.body.text,
      })

      Answer.findOneAndUpdate({
        userId: req.user.id,
        questionId: qusetion.id,
      }, {
        userId: req.user.id,
        questionId: qusetion.id,
        text: req.body.text,
      }, {
        upsert: true,
        new: true,
      }, (err, answer: AnswerModel) => {
        if (err) {
          return next(err);
        }

        if (!answer) {
          res.status(HttpStatus.UNPROCESSABLE_ENTITY).send('답변 저장에 실패했습니다.');
          return null;
        }

        res.status(HttpStatus.OK).json(answer);
      })
    })
  })
});

export default router;