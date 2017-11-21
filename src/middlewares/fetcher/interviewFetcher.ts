/* External dependnecies */
import { Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';

/* Internal dependnecis */
import { default as Interview, InterviewModel } from '../../models/Interview';
import { ImsRequest } from '../../interfaces/express';
import { CustomError, errorCreator } from '../../utils/errorUtils';
import errorMessage from '../../constants/errorMessage';

const findOne = (selectorCreator: (req: ImsRequest) => any) => (req: ImsRequest, res: Response, next: NextFunction): void => {
  Interview.findOne(selectorCreator(req), (err, interview: InterviewModel): void => {
    if (err) {
      return next(err);
    }

    if (!interview) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        error: errorCreator(
          'interview',
          errorMessage.NOT_EXISTED_INTERVIEW
        ),
      });
      return null;
    }

    req.interview = interview;
    next();
  });
}

export default {
  findOne,
}