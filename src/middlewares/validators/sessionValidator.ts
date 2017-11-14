/* External dependencies */
import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import * as validator from 'validator';

/* Internal dependencies */
import { default as User, UserModel } from '../../models/User';
import { CustomError, errorCreator } from '../../utils/errorUtils';
import errorMessage from '../../constants/errorMessage';

export default (req: Request, res: Response, next: NextFunction): void => {
  const { email = '', name = '', mobileNumber = '' } = req.body;
  const errors: CustomError[] = [];

  /* Start email validation */

  ((): void => {
    if (validator.isEmpty(email)) {
      errors.push(errorCreator(
        'email',
        errorMessage.NONE_EMPTY,
      ));
      return null;
    }

    if (!validator.isEmail(email)) {
      errors.push(errorCreator(
        'email',
        errorMessage.INVALID_EMAIL,
      ));
      return null;
    }
  })();

  /* End email validation */

  /* Start Session validation */

  ((): void => {
    if (name && name.length > 20) {
      errors.push(errorCreator(
        'name',
        errorMessage.TOO_LONG_SESSION_NAME
      ));
      return null;
    }
  })();

  /* End Session validation */


  /* Start Mobile Number validation */

  ((): void => {
    if (mobileNumber && !validator.isMobilePhone(mobileNumber, 'ko-KR')) {
      errors.push(errorCreator(
        'mobileNumber',
        errorMessage.NOT_MOBILE_NUMBER,
      ));
      return null;
    }
  })();

  /* End Mobile Number validation */

  if (errors.length) {
    res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({ errors });
    return null;
  }

  next();
}