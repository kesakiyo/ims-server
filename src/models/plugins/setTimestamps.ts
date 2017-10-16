/* External dependnecies */
import { Schema } from 'mongoose';
import { NextFunction } from 'express';

/* Internal dependnecies */
import { getCurrentTime } from '../../utils/timeUtils';

export default (schema: Schema) => {
  schema.add({
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
  })
  
  schema.pre('save', function(next: NextFunction) {
    console.log('hello', this);
    this.updatedAt = getCurrentTime();
    if (!this.createdAt) {
      this.createdAt = getCurrentTime();
    }
    next();
  })
}