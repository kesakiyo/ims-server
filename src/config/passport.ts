/* External dependnecies */
import { Request, Response, NextFunction } from 'express';
import * as passport from 'passport';
import * as passportLocal from 'passport-local';
import * as HttpStatus from 'http-status-codes';

/* Internal dependnecies */
import User from '../models/User';
import errorMessage from '../constants/errorMessage';

const initizliaer = (passport: passport.Passport) => {
  const LocalStrategy = passportLocal.Strategy;
  
  passport.serializeUser<any, any>((user, done) => {
    done(undefined, user.id);
  });
    
  passport.deserializeUser((id, done) => {
    User.findOne({ id }, (err, user) => {
      done(err, user);
    });
  });

  /**
   * Sign in using Email and Password.
   */
  passport.use('local', new LocalStrategy({  usernameField: 'email', passwordField: 'password' }, (email, password, done) => {
    User.findOne({ email: email.toLowerCase() }, (err, user: any) => {
      if (err) { 
        return done(err);
      }

      if (!user) {
        return done(undefined, false, { message: errorMessage.NOT_EXISTED_EMAIL });
      }

      user.comparePassword(password, (err: Error, isMatch: boolean) => {
        if (err) { 
          return done(err); 
        }

        if (isMatch) {
          return done(undefined, user);
        }

        return done(undefined, user, { message: errorMessage.PASSWORD_NOT_MATCH });
      });
    });
  }))
}

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(HttpStatus.UNAUTHORIZED).json('로그인을 해 주세요');
}

export default {
  initizliaer,
  isAuthenticated,
};