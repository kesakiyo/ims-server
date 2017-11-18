/* External dependencies */
import * as _ from 'lodash';
import * as express from 'express';
import { Document } from 'mongoose';
import { Router, Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';

/* Internal dependencies */
import passportConfig from '../config/passport';
import { default as Question, QuestionModel } from '../models/Question';
import { default as Session, SessionModel } from '../models/Session';
import { default as Answer, FileInterface, AnswerModel } from '../models/Answer';
import { CustomError, errorCreator } from '../utils/errorUtils';
import multer from '../middlewares/multer';
import fileUploader from '../utils/fileUploader';
import errorMessage from '../constants/errorMessage';
import { HttpRequest } from 'aws-sdk/lib/http_request';

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

      if (session.isPublished()) {
        res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
          error: errorCreator(
            'published',
            errorMessage.NOT_ALLOWED_UPSERT_ANSWER_AFTER_PUBLISHED
          )
        });
        return null;
      }

      if (!qusetion.isTextType()) {
        req.body.text = '';
      }

      if (qusetion.isTextType() && (req.body.text || '').length > qusetion.limit) {
        res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
          error: errorCreator(
            'length',
            errorMessage.TOO_LONG_ANSWER_LENGTH
          )
        });
        return null;
      }

      if (qusetion.isCheckBoxType() || qusetion.isRadioType()) {
        if (!_.isArray(req.body.values)) {
          res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
            error: errorCreator(
              'values',
              errorMessage.NOT_EXISTED_ANSWER_VALUES
            )
          });
          return null;
        }

        if ((req.body.values as string[]).filter(value => !_.isString(value)).length) {
          res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
            error: errorCreator(
              'values',
              errorMessage.NOT_ALLOWED_ANSWER_VALUES
            )
          });
          return null;
        }

        if (qusetion.isCheckBoxType() && req.body.values.length !== 1) {
          res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
            error: errorCreator(
              'values',
              errorMessage.NOT_ALLOWED_MULTIPLE_VALUES
            )
          })
          return null;
        }
      }

      Answer.findOne({ userId: req.user.id, questionId: qusetion.id }, (err, answer: AnswerModel): void => {
        if (err) {
          return next(err);
        }

        const newAnswer: Document = (() => {
          if (answer) {
            answer.text = req.body.text;
            answer.values = req.body.values;
            return answer;
          }
          return new Answer({
            userId: req.user.id,
            questionId: qusetion.id,
            interviewId: qusetion.interviewId,
            values: req.body.values,
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
    });
  })
});

/**
 * @api {post} /v1/answers/:id/file upload file at answer
 * @apiGroup Answer
 * @apiName Upload file
 * @apiDescription Upload file at answer
 *
 * @apiSuccessExample {json} Success-Response:
 *    {
 *        file: {
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
router.post('/:id/answers/:answerId/files', passportConfig.isAuthenticated, multer.any(), (req: Request, res: Response, next: NextFunction): void => {
  Question.findOne({ id: req.params.id }, (err, qusetion: QuestionModel): void => {
    if (err) {
      return next(err);
    }

    if (!qusetion || !qusetion.isFileType()) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        error: errorCreator(
          'type',
          errorMessage.NOT_ALLOWED_FILE
        )
      })
      return
    }

    Answer.findOne({ userId: req.user.id, questionId: qusetion.id }, (err, answer: AnswerModel): void => {
      if (err) {
        return next(err);
      }

      if (!answer || answer.userId !== req.user.id) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          error: errorCreator(
            'userId',
            errorMessage.NOT_ALLOWED_CREATE_FILE
          )
        })
        return null;
      }

      if (req.files) {
        fileUploader(req.files, req.user)
          .then((data: FileInterface) => {
            answer.file = data;
            answer.save((err, savedAnswer: AnswerModel) => {
              if (err) {
                return next(null);
              }

              res.status(HttpStatus.OK).json({ answer: savedAnswer });
            })
          }, (err) => {
            return next(err);
          })
      } else {
        answer.file = null;
        answer.save((err, savedAnswer: AnswerModel): void => {
          if (err) {
            return next(err);
          }

          res.status(HttpStatus.OK).json({ answer: savedAnswer });
        })
      }
    });
  });
});

export default router;