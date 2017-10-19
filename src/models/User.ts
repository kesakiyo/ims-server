/* External dependencies */
import * as mongoose from 'mongoose';
import { Schema, Model, Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

/* Internal dependencies */
import secret from '../config/secret'
import setTimestamps from './plugins/setTimestamps';
import setAutoIncId from './plugins/setAutoIncId';
import hideField from './plugins/hideField';

export type UserModel = mongoose.Document & {
  email: String,
  password: String,

  comparePassword: (candidatePassword: String, cb: (err: any, isMatch: any) => {}) => void
};

const userSchema: Schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    hidden: true,
  },
});

// todo: 추후 Global 하게 등록할 수 있는 방법 생각...
userSchema.plugin(setTimestamps);
userSchema.plugin(setAutoIncId, { schemaName: 'UserId' });
userSchema.plugin(hideField);

userSchema.pre('save', function save(next) {
  const user = this;

  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(secret.SALT_WORK_FACTOR, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }

      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (candidatePassword: string, cb: (err: any, isMatch: boolean) => {}) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

const User: Model<Document> = mongoose.model('User', userSchema);

export default User;