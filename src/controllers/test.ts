/* External dependencies */
import * as express from 'express';
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';

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

export default router;