export interface Error {
  field: string,
  message: string,
}

export const errorCreator = (field: string, message: string): Error => ({ field, message })
