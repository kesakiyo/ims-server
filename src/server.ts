/* External dependencies */
import * as express from 'express';
import { Express, Router } from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as compression from 'compression';
import * as session from 'express-session';
import * as passport from 'passport';

/* Internal dependencies */
import test from './controllers/test';
import users from './controllers/users';
import secret from './config/secret';

/* API keys and Passport configuration. */
import passportConfig from './config/passport';

process.env.TZ = 'Asia/Seoul';

/* Connect to mongodb */
mongoose.connect(secret.MONGO_URL, { useMongoClient: true, promiseLibrary: global.Promise }, (err): void => {
  if (err) {
    console.log('Occurred the error when connecting mongodb: ', err);
  }
});

/* Create Express Server */
const app: Express = express();

/* Apply Middleware */
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secret.SESSION_SECERET,
}));
app.use(passport.initialize());
app.use(passport.session());

passportConfig.initizliaer(passport);

/* Setting for router */
app.use('/v1', ((): Router => {
  const router: Router = express.Router();

  router.use('/test', test);
  router.use('/users', users);
  
  return router;
})());

/* Start app */
app.listen(3000, (): void => {
  console.log('ims-server app listening on port 3000');
});