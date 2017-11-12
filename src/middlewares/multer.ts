/* External dependencies */
import { Request, Response, NextFunction } from 'express';
import * as multer from 'multer';

const memorystorage = multer.memoryStorage();

export default multer({ storage: memorystorage })