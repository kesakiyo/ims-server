/* External dependencies */
import * as express from 'express';
import { Router, Request, Response } from 'express';

const router: Router = express.Router();

router.get('/ping', (req: Request, res: Response): void => {
  res.send('pong')
});

export default router;