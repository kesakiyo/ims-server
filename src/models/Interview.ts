/* External dependencies */
import * as mongoose from 'mongoose';
import { Schema, Model, Document } from 'mongoose';

/* Internal dependencies */
import secret from '../config/secret'
import setTimestamps from './plugins/setTimestamps';
import setAutoIncId from './plugins/setAutoIncId';
import hideField from './plugins/hideField';

export type InterviewModel = mongoose.Document & {
  _id: string,
  id: number,
  title: string,
  description: string,
  startTime: number,
  endTime: number,
  createdAt: number,
  updatedAt: number,
};

const InterviewSchema: Schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  startTime: {
    type: Number,
    required: true,
  },
  endTime: {
    type: Number,
    required: true,
  },
});

InterviewSchema.plugin(setTimestamps);
InterviewSchema.plugin(setAutoIncId, { schemaName: 'InterviewId' });
InterviewSchema.plugin(hideField);

const Interview: Model<Document> = mongoose.model('Interview', InterviewSchema);

export default Interview;