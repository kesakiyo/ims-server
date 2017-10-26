/* External dependencies */
import * as mongoose from 'mongoose';
import { Schema, Model, Document } from 'mongoose';

/* Internal dependencies */
import setTimestamps from './plugins/setTimestamps';

export type IdCounterModel = mongoose.Document & {
  _id: String,
  seq: Number,
};

const idCounterSchema: Schema = new mongoose.Schema({
  _id: {
    type: String,
    unique: true,
  },
  seq: {
    type: Number,
  },
});

const IdCounter: Model<Document> = mongoose.model('IdCounter', idCounterSchema);

export default IdCounter;