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
  createdAt: number,
  updatedAt: number,
};

const SessionSchema: Schema = new mongoose.Schema({
  role: String,
  user: {
    type: String,
    ref: 'User',
  },
});

SessionSchema.plugin(setTimestamps);
SessionSchema.plugin(setAutoIncId, { schemaName: 'SessionId' });
SessionSchema.plugin(hideField);

const Session: Model<Document> = mongoose.model('Session', SessionSchema);

export default Session;