/* External dependencies */
import * as mongoose from 'mongoose';
import { Schema, Model, Document } from 'mongoose';

/* Internal dependencies */
import setTimestamps from './plugins/setTimestamps';
import setAutoIncId from './plugins/setAutoIncId';
import hideField from './plugins/hideField';

export interface FileInterface {
  name: string,
  url: string,
  size: number,
  mimeType: string,
}

export type AnswerModel = mongoose.Document & {
  _id: string,
  id: number,
  text: string,
  values: string[],
  file: FileInterface,
  userId: number,
  questionId: number,
  interviewId: number,
  createdAt: number,
  updatedAt: number,
};

const AnswerSchema: Schema = new mongoose.Schema({
  text: String,
  values: [String],
  file: Object,
  userId: {
    type: Number,
    required: true,
    ref: 'User',
  },
  questionId: {
    type: Number,
    required: true,
    ref: 'Question',
  },
  interviewId: {
    type: Number,
    required: true,
    ref: 'Interview',
  }
});

AnswerSchema.index({
  userId: 1,
  questionId: 1,
}, {
  unique: true,
})

AnswerSchema.index({
  userId: 1,
  interviewId: 1,
})

AnswerSchema.plugin(setTimestamps);
AnswerSchema.plugin(setAutoIncId, { schemaName: 'AnswerId' });
AnswerSchema.plugin(hideField);

const Answer: Model<Document> = mongoose.model('Answer', AnswerSchema);

export default Answer;
