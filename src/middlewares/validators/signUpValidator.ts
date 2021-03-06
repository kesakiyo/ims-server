/* External dependencies */
import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import * as validator from 'validator';

/* Internal dependencies */
import { default as User, UserModel } from '../../models/User';
import { CustomError, errorCreator } from '../../utils/errorUtils';
import errorMessage from '../../constants/errorMessage';

export default (req: Request, res: Response, next: NextFunction): void => {
  const { email = '', password = '', passwordConfirm = '' } = req.body;
  const errors: CustomError[] = [];

  /* Start email validation */

  ((): void => {
    if (validator.isEmpty(email)) {
      errors.push(errorCreator(
        'email',
        errorMessage.NONE_EMPTY,
      ))
      return null;
    }

    if (!validator.isEmail(email)) {
      errors.push(errorCreator(
        'email',
        errorMessage.INVALID_EMAIL,
      ))
      return null;
    }
  })();

  /* End email validation */


  /* Start password validation */

  ((): void => {
    if (validator.isEmpty(password)) {
      errors.push(errorCreator(
        'password',
        errorMessage.NONE_EMPTY,
      ))
      return null;
    }

    if (!validator.isLength(password, { min: 1, max: 20 })) {
      errors.push(errorCreator(
        'password',
        errorMessage.TOO_LONG_PASSWORD,
      ))
      return null;
    }
  })();

  /* End password validation */


  /* Start password confirm validation */

  ((): void => {
    if (validator.isEmpty(passwordConfirm)) {
      errors.push(errorCreator(
        'passwordConfirm',
        errorMessage.NONE_EMPTY,
      ))
      return null;
    }

    if (!validator.isLength(password, { min: 1, max: 20 })) {
      errors.push(errorCreator(
        'passwordConfirm',
        errorMessage.TOO_LONG_PASSWORD_CONFIRM,
      ))
      return null;
    }

    if (password !== passwordConfirm) {
      errors.push(errorCreator(
        'passwordConfirm',
        errorMessage.PASSWORD_CONFIRM_NOT_MATCH,
      ))
      return null;
    }
  })();

  /* End passowrd confirm validation */

  if (errors.length) {
    res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({ errors });
    return null;
  }

  /* Start check to exist user */
  User.findOne({ email }, (err, existingUser): void => {
    if (err) {
      return next(err);
    }

    if (existingUser) {
      errors.push(errorCreator(
        'email',
        errorMessage.EXISTED_EMAIL,
      ))

      res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({ errors });
      return null;
    }

    return next();
  })
}