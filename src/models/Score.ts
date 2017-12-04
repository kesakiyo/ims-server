/* External dependencies */
import * as mongoose from 'mongoose';
import { Schema, Model, Document } from 'mongoose';

/* Internal dependencies */
import setTimestamps from './plugins/setTimestamps';
import setAutoIncId from './plugins/setAutoIncId';
import hideField from './plugins/hideField';
import questionType from '../constants/questionType';

export type ScoreModel = mongoose.Document & {
  _id: string,
  id: number,
  value: number,
  interviewId: number,
  questionId: number,
  answerId: number,
  userId: number,
  createdAt: number,
  updatedAt: number,
};

const ScoreSchema: Schema = new mongoose.Schema({
  value: {
    type: Number,
    required: true,
  },
  interviewId: {
    type: Number,
    required: true,
    ref: 'Interview',
  },
  questionId: {
    type: Number,
    required: true,
    ref: 'Question',
  },
  answerId: {
    type: Number,
    required: true,
    ref: 'Answer',
  },
  userId: {
    type: Number,
    required: true,
    ref: 'User',
  },
  createdUserId: {
    type: Number,
    required: true,
    ref: 'User',
  },
});

ScoreSchema.index({
  interviewId: 1,
  userId: 1,
});

ScoreSchema.index({
  answerId: 1,
  createdUserId: 1,
}, {
  unique: true,
});

ScoreSchema.plugin(setTimestamps);
ScoreSchema.plugin(setAutoIncId, { schemaName: 'ScoreId' });
ScoreSchema.plugin(hideField);

const Score: Model<Document> = mongoose.model('Score', ScoreSchema);

export default Score;