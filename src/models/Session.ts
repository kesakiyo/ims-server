/* External dependencies */
import * as mongoose from 'mongoose';
import { Schema, Model, Document } from 'mongoose';

/* Internal dependencies */
import setTimestamps from './plugins/setTimestamps';
import setAutoIncId from './plugins/setAutoIncId';
import hideField from './plugins/hideField';
import SessionRole from '../constants/sessionRole';

export type SessionModel = mongoose.Document & {
  _id: string,
  id: number,
  role: string,
  userId: number,
  interviewId: number,
  createdAt: number,
  updatedAt: number,

  isMaster: () => boolean,
};

const SessionSchema: Schema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
  interviewId: {
    type: Number,
    required: true,
    ref: 'Interview',
  },
  userId: {
    type: Number,
    required: true,
    ref: 'User',
  },
});

SessionSchema.index({
  interviewId: 1,
  userId: 1,
}, {
  unique: true,
})

SessionSchema.plugin(setTimestamps);
SessionSchema.plugin(setAutoIncId, { schemaName: 'SessionId' });
SessionSchema.plugin(hideField);

SessionSchema.methods.isMaster = function ():boolean {
  return this.role === SessionRole.MASTER;
}

const Session: Model<Document> = mongoose.model('Session', SessionSchema);

export default Session;