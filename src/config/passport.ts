// External dependnecies
import { Request, Response, NextFunction } from 'express';
import * as passport from 'passport';
import * as passportLocal from 'passport-local';
import * as HttpStatus from 'http-status-codes';

// Internal dependnecies
import User from '../models/User';

const initizliaer: (passport: passport.Passport) => void = (passport: passport.Passport): void => {
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
        return done(undefined, false, { message: `Email ${email} not found.` });
      }

      user.comparePassword(password, (err: Error, isMatch: boolean) => {
        if (err) { 
          return done(err); 
        }

        if (isMatch) {
          return done(undefined, user);
        }

        return done(undefined, false, { message: "Invalid email or password." });
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