/* External dependencies */
import * as express from 'express';
import { Express, Router } from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as connectMongo from 'connect-mongo';
import * as compression from 'compression';
import * as session from 'express-session';
import * as passport from 'passport';
import * as cors from 'cors';
import * as HttpStatus from 'http-status-codes';

/* Internal dependencies */
import test from './controllers/test';
import users from './controllers/users';
import sessions from './controllers/sessions';
import interviews from './controllers/interviews';
import questions from './controllers/questions';
import answers from './controllers/answers';
import secret from './config/secret';
import { getCurrentTime } from './utils/timeUtils';
import { errorCreator } from './utils/errorUtils'

/* API keys and Passport configuration. */
import passportConfig from './config/passport';

process.env.TZ = 'Asia/Seoul';

const MONGO_URL = (() => {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'exp') {
    return secret.MONGO_DEV_URL;
  }
  return secret.MONGO_URL;
})();

console.log(`express server is running on the ${process.env.NODE_ENV}`);

/* Connect to mongodb */
mongoose.connect(MONGO_URL, { useMongoClient: true, promiseLibrary: global.Promise }, (err): void => {
  if (err) {
    console.log('Occurred the error when connecting mongodb: ', err);
  }
});

/* Create Express Server */
const app: Express = express();

/* Mongo Store for persistent session */
const MongoStore = connectMongo(session);

/* Apply Middleware */
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
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
app.use(cors({
  origin: true,
  credentials: true,
}));

passportConfig.initizliaer(passport);

/* Check out of date */
app.use((req, res, next) => {
  const current = getCurrentTime();
  if (current > 1512831599000) {
    res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      error: errorCreator(
        'time',
        '지원이 종료되었습니다.'
      ),
    });
  } else {
    next();
  }
})

/* Setting for router */
app.use('/v1', ((): Router => {
  const router: Router = express.Router();

  router.use('/test', test);
  router.use('/users', users);
  router.use('/sessions', sessions);
  router.use('/interviews', interviews);
  router.use('/questions', questions);
  router.use('/answers', answers);

  return router;
})());

const PORT = (() => {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'exp') {
    return 3001;
  }
  return 3000;
})();

/* Start app */
app.listen(PORT, (): void => {
  console.log(`ims-server app listening on port ${PORT}`);
});