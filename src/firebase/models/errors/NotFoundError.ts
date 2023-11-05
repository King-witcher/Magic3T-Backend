export class NotFoundError extends Error {
  constructor(collection: string, id: string) {
    super(`Cannot find document with id ${id} in collection ${collection}`)
  }
}
