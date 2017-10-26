/* External dependencies */
import * as mongoose from 'mongoose';
import { Schema, Model, Document } from 'mongoose';

/* Internal dependencies */
import setTimestamps from './plugins/setTimestamps';
import setAutoIncId from './plugins/setAutoIncId';
import hideField from './plugins/hideField';

export type QuestionModel = mongoose.Document & {
  _id: string,
  id: number,
  title: string,
  description: string,
  type: string,
  interviewId: number,
  createdAt: number,
  updatedAt: number,
};

const QuestionSchema: Schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  type: {
    type: String,
    required: true,
  },
  interviewId: {
    type: Number,
    required: true,
    ref: 'Interview',
  },
});

QuestionSchema.plugin(setTimestamps);
QuestionSchema.plugin(setAutoIncId, { schemaName: 'QuestionId' });
QuestionSchema.plugin(hideField);

const Question: Model<Document> = mongoose.model('Question', QuestionSchema);

export default Question;