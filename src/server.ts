/* External dependencies */
import * as express from 'express';
import { Express, Router } from 'express';

/* Internal dependencies */
import test from './routes/test';

const app: Express = express();
const router: Router = express.Router();

app.use('/v1', ((): Router => {
  router.use('/test', test);
  return router;
})());

app.listen(3000, (): void => {
  console.log('ims-server app listening on port 3000')
});