export interface CustomError {
  field: string,
  message: string,
}

export const errorCreator = (field: string, message: string): CustomError => ({ field, message })
