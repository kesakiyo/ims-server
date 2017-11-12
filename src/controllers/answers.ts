/* External dependencies */
import * as express from 'express';
import { Document } from 'mongoose';
import { Router, Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';

/* Internal dependencies */
import passportConfig from '../config/passport';
import { default as Answer, AnswerModel } from '../models/Answer';
import { CustomError, errorCreator } from '../utils/errorUtils';
import errorMessage from '../constants/errorMessage';

const router: Router = express.Router();

export default router;