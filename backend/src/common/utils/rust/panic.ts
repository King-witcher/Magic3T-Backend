export class Panic extends Error {
  constructor(message?: string) {
    super(message)
    this.name = 'panic'
  }
}

export function panic(message?: string): never {
  throw new Panic(message)
}
