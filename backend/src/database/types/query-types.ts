export type GetResult<T> = {
  id: string
  createdAt: Date
  updatedAt: Date
  data: T
}

export type CreateCommand<T> = {
  id?: string
  data: T
}

export type UpdateCommand<T> = {
  id: string
  data: DeeplyPartial<T>
}

export type DeeplyPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeeplyPartial<T[P]> : T[P]
}

export const enum InternalValue {
  CurrentDate,
  Increment,
}
