/* External dependencies */
import * as express from 'express';
import { Express, Router } from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as session from 'express-session';

/* Internal dependencies */
import ping from './controllers/ping';
import users from './controllers/users';
import secret from './config/secret';

/* API keys and Passport configuration. */
import * as passportConfig from './config/passport';

/* Create Express Server */
const app: Express = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
}));

mongoose.connect(secret.MONGO_URL, { useMongoClient: true, promiseLibrary: global.Promise }, (err): void => {
  if (err) {
    console.log('Occurred the error when connecting mongodb: ', err);
  }
});

app.use('/v1', ((): Router => {
  const router: Router = express.Router();

  router.use('/ping', ping);
  router.use('/users', users);
  
  return router;
})());

app.listen(3000, (): void => {
  console.log('ims-server app listening on port 3000');
});