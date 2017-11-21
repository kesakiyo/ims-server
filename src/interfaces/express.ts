/* External dependencies */
import { Request } from 'express';

/* Internal dependencies */
import { InterviewModel } from '../models/Interview';
import { SessionModel as ImsSessionModel } from '../models/Session';
import { QuestionModel } from '../models/Question';
import { AnswerModel } from '../models/Answer';

export interface ImsRequest extends Request {
  interview: InterviewModel,
  interviews: InterviewModel[],

  imsSession: ImsSessionModel,
  imsSessions: ImsSessionModel[],

  question: QuestionModel,
  questions: QuestionModel[],

  answer: AnswerModel,
  answers: AnswerModel[],
}
