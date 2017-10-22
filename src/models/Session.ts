/* External dependencies */
import * as mongoose from 'mongoose';
import { Schema, Model, Document } from 'mongoose';

/* Internal dependencies */
import secret from '../config/secret'
import setTimestamps from './plugins/setTimestamps';
import setAutoIncId from './plugins/setAutoIncId';
import hideField from './plugins/hideField';

export type SessionModel = mongoose.Document & {
  _id: string,
  id: number,
  role: string,
  user: string,
  interview: string,
  createdAt: number,
  updatedAt: number,
};

const SessionSchema: Schema = new mongoose.Schema({
  role: String,
  interview: {
    type: String,
    ref: 'Interview',
  },
  user: {
    type: String,
    ref: 'User',
  },
});

SessionSchema.index({
  interview: 1,
  user: 1,
}, {
  unique: true,
})

SessionSchema.plugin(setTimestamps);
SessionSchema.plugin(setAutoIncId, { schemaName: 'SessionId' });
SessionSchema.plugin(hideField);

const Session: Model<Document> = mongoose.model('Session', SessionSchema);

export default Session;