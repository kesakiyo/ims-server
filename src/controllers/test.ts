/* External dependencies */
import * as express from 'express';
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';

/* Internal dependencies */
import passportConfig from '../config/passport';

const router: Router = express.Router();

/**
 * @api {get} /v1/test/ping Ping
 * @apiGroup Test
 * @apiName Ping
 *
 * @apiSuccessExample {String} Success-Response:
 *    pong
 */
router.get('/ping', (req: Request, res: Response): void => {
  res.send('pong')
});

/**
 * @api {post} /v1/test/me Get Me
 * @apiGroup Test
 * @apiName Me
 * @apiDescription Reuqest user to server, If you don't sign in, server sends error code.
 *
 * @apiSuccessExample {json} Success-Response:
 *    {
 *        email: 'string'
 *    }
 */
router.get('/me', passportConfig.isAuthenticated, (req: Request, res: Response): void => {
  res.status(HttpStatus.OK).json(req.user);
});

export default router;