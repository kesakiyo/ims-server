// External dependencies
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as connectMongo from 'connect-mongo';
import * as debuggerCreator from 'debug';
import * as express from 'express';
import { Express, Router } from 'express';
import * as session from 'express-session';
import * as mongoose from 'mongoose';
import * as passport from 'passport';

// Internal dependencies
import secret from './config/secret';
import interviews from './controllers/interviews';
import sessions from './controllers/sessions';
import test from './controllers/test';
import users from './controllers/users';

// API keys and Passport configuration.
import passportConfig from './config/passport';

// Time Zone setting
process.env.TZ = 'Asia/Seoul';

const DEBUG: debuggerCreator.IDebugger = debuggerCreator('ims:debug');
const ERROR: debuggerCreator.IDebugger = debuggerCreator('ims:error');

// Connect to mongodb
mongoose.connect(secret.MONGO_URL, { useMongoClient: true, promiseLibrary: global.Promise }, (err: {}): void => {
  if (err) {
    ERROR('Occurred the error when connecting mongodb: ', err);
  }
});

// Create Express Server
const app: Express = express();

// Mongo Store for persistent session
const MongoStore: connectMongo.MongoStoreFactory = connectMongo(session);

// Apply Middleware
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    collection: 'signin-sessions',
  }),
  resave: false,
  saveUninitialized: true,
  secret: secret.SESSION_SECERET,
}));
app.use(passport.initialize());
app.use(passport.session());

passportConfig.initizliaer(passport);

// Setting for router
app.use('/v1', ((): Router => {
  const router: Router = express.Router();

  router.use('/test', test);
  router.use('/users', users);
  router.use('/sessions', sessions);
  router.use('/interviews', interviews);

  return router;
})());

// Start app
app.listen(3000, (): void => {
  DEBUG('ims-server app listening on port 3000');
});
