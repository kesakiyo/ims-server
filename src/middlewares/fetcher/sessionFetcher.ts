/* External dependnecies */
import { Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';

/* Internal dependnecis */
import { default as Session, SessionModel } from '../../models/Session';
import { ImsRequest } from '../../interfaces/express';
import { CustomError, errorCreator } from '../../utils/errorUtils';
import errorMessage from '../../constants/errorMessage';

const findOne = (selectorCreator: (req: ImsRequest) => any) => (req: ImsRequest, res: Response, next: NextFunction): void => {
  Session.findOne(selectorCreator(req), (err, session: SessionModel): void => {
    if (err) {
      return next(err);
    }

    if (!session) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        error: errorCreator(
          'session',
          errorMessage.NOT_EXISTED_SESSION
        ),
      });
      return null;
    }

    req.imsSession = session;
    next();
  });
}

export default {
  findOne,
}