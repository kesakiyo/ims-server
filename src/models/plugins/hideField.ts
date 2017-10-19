/* External dependnecies */
import { Schema, Query } from 'mongoose';
import { NextFunction } from 'express';

const defaultHiddenFiles: string[] = ['_id', '__v'];

export default (schema: Schema, options: { fieldName: boolean }) => {
  const deleteFieldNames: string[] = defaultHiddenFiles.concat(
    Object.keys(schema.tree).filter((key: string) => schema.tree[key].hidden)
  )

  schema.set('toJSON', {
    transform: (doc: any, ret: any, options: any) => {
      deleteFieldNames.forEach((field: string) => {
        delete ret[field];
      })

      return ret;
    }
  })
}