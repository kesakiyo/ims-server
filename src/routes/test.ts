/* External dependencies */
import * as express from 'express';
import { Router, Request, Response } from 'express';

const router: Router = express.Router();

/**
 * @api {get} /v1/test/ping Request ping to server
 * @apiName Ping
 * @apiGroup Test
 *
 * @apiSuccessExample {String} Success-Response:
 *    pong
 */
router.get('/ping', (req: Request, res: Response): void => {
  res.send('pong')
});

export default router;