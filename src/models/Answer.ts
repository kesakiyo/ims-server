/* External dependencies */
import * as mongoose from 'mongoose';
import { Schema, Model, Document } from 'mongoose';

/* Internal dependencies */
import setTimestamps from './plugins/setTimestamps';
import setAutoIncId from './plugins/setAutoIncId';
import hideField from './plugins/hideField';

export type AnswerModel = mongoose.Document & {
  _id: string,
  id: number,
  text: string,
  file: string,
  userId: number,
  questionId: number,
  createdAt: number,
  updatedAt: number,
};

const AnswerSchema: Schema = new mongoose.Schema({
  text: String,
  file: String,
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
});

AnswerSchema.index({
  userId: 1,
  questionId: 1,
}, {
  unique: true,
})


AnswerSchema.plugin(setTimestamps);
AnswerSchema.plugin(setAutoIncId, { schemaName: 'AnswerId' });
AnswerSchema.plugin(hideField);

const Answer: Model<Document> = mongoose.model('Answer', AnswerSchema);

export default Answer;
