/* External dependencies */
import * as _ from 'lodash';
import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import * as validator from 'validator';

/* Internal dependencies */
import { default as User, UserModel } from '../../models/User';
import { default as Session, SessionModel } from '../../models/Session';
import { CustomError, errorCreator } from '../../utils/errorUtils';
import errorMessage from '../../constants/errorMessage';
import questionType from '../../constants/questionType';
import { error } from 'util';

export default (req: Request, res: Response, next: NextFunction): void => {
  const { title = '', description = '', type = '', values, limit = 0, interviewId = 0 } = req.body;
  const errors: CustomError[] = [];

  /* Start title validation */

  ((): void => {
    if (validator.isEmpty(title)) {
      errors.push(errorCreator(
        'title',
        errorMessage.NONE_EMPTY
      ));
      return null;
    }

    if (!validator.isLength(title, { min: 1, max: 100 })) {
      errors.push(errorCreator(
        'title',
        errorMessage.TOO_LONG_QUESTION_TITLE
      ));
      return null;
    }
  })();

  /* End title validation */


  /* Start description validation */

  ((): void => {
    if (description && !validator.isLength(description, { min: 0, max: 500 })) {
      errors.push(errorCreator(
        'description',
        errorMessage.TOO_LONG_QUESTION_DESCRIPTION
      ));
      return null;
    }
  })();

  /* End description validation */

  /* Start type validation */

  ((): void => {
    if (_.values(questionType).indexOf(type) === -1) {
      errors.push(errorCreator(
        'type',
        errorMessage.NOT_ALLOWED_QUESTION_TYPE
      ));
      return null;
    }

    if (type === questionType.RADIO || type === questionType.CHECK_BOX) {
      if (!values) {
        errors.push(errorCreator(
          'values',
          errorMessage.NOT_EXISTED_QUESTION_VALUES
        ));
        return null;
      }

      if (!_.isArray(values)) {
        errors.push(errorCreator(
          'values',
          errorMessage.NOT_ALLOWED_QUESTION_VALUES
        ));
        return null;
      }

      if (values.filter(value => !_.isString(value)).length) {
        errors.push(errorCreator(
          'values',
          errorMessage.NOT_ALLOWED_QUESTION_VALUES
        ));
        return null;
      }
    }
  })();

  /* End type validation */

  /* Start limit validation */

  ((): void => {
    if (type === questionType.TEXT && !limit) {
      errors.push(errorCreator(
        'limit',
        errorMessage.NOT_EXISTED_QUESTION_LIMIT
      ));
      return null;
    }

    if (type === questionType.TEXT && limit > 10000) {
      errors.push(errorCreator(
        'limit',
        errorMessage.TOO_LONG_QUESTION_LIMIT
      ));
      return null;
    }
  })();

  /* End limit validation */

  if (errors.length) {
    res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({ errors });
    return null;
  }

  next();
}