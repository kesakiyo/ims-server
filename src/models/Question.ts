/* External dependencies */
import * as mongoose from 'mongoose';
import { Schema, Model, Document } from 'mongoose';

/* Internal dependencies */
import setTimestamps from './plugins/setTimestamps';
import setAutoIncId from './plugins/setAutoIncId';
import hideField from './plugins/hideField';
import questionType from '../constants/questionType';

export type QuestionModel = mongoose.Document & {
  _id: string,
  id: number,
  title: string,
  description: string,
  type: string,
  values: string[],
  limit: number,
  interviewId: number,
  createdAt: number,
  updatedAt: number,

  isFileType: () => boolean,
  isTextType: () => boolean,
  isRadioType: () => boolean,
  isCheckBoxType: () => boolean,
};

const QuestionSchema: Schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  description: {
    type: String,
    default: '',
    maxlength: 500,
  },
  type: {
    type: String,
    required: true,
  },
  values: [String],
  limit: {
    type: Number,
    max: 10000,
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

QuestionSchema.methods.isFileType = function() {
  return this.type === questionType.FILE;
}

QuestionSchema.methods.isTextType = function() {
  return this.type === questionType.TEXT;
}

QuestionSchema.methods.isRadioType = function() {
  return this.type === questionType.RADIO;
}

QuestionSchema.methods.isCheckBoxType = function() {
  return this.type === questionType.CHECK_BOX;
}

const Question: Model<Document> = mongoose.model('Question', QuestionSchema);

export default Question;