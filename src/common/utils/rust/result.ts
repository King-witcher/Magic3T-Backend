import { panic } from './panic'

/**
 * A Result type inspired by Rust that represents either success (Ok) or failure (Err)
 */
export type Result<T, E = Error> = OkClass<T, E> | ErrClass<T, E>

export namespace Result {
  export function fromPromise<T, E = unknown>(
    promise: Promise<T>
  ): Promise<Result<T, E>> {
    return promise
      .then((value) => new OkClass<T, E>(value))
      .catch((error) => new ErrClass(error as E))
  }

  /** Deserializes a SerializableResult into a Result. */
  export function deserialize<T, E>(
    obj: SerializableResult<T, E>
  ): Result<T, E> {
    if (obj._tag === 'Ok') return new OkClass(obj.value)
    return new ErrClass(obj.error)
  }

  export function Ok<T, E>(value: T): Result<T, E> {
    return new OkClass(value)
  }

  export function Err<T, E>(error: E): Result<T, E> {
    return new ErrClass(error)
  }

  /**
   * Type guard to check if a value is a Result.
   */
  export function isResult(value: unknown): value is Result<unknown, unknown> {
    return value instanceof OkClass || value instanceof ErrClass
  }
}

export type SerializableResult<T, E> =
  | { _tag: 'Ok'; value: T }
  | { _tag: 'Err'; error: E }

export function ok<T, E>(value: T): Result<T, E> {
  return new OkClass(value)
}

export function err<T, E>(error: E): Result<T, E> {
  return new ErrClass(error)
}

class OkClass<T, E> {
  readonly _tag = 'Ok'
  constructor(readonly value: T) {}

  /**
   * Returns true if the result is Ok.
   */
  isOk(): this is OkClass<T, E> {
    return true
  }

  /**
   * Returns true if the result is Err.
   */
  isErr(): this is ErrClass<T, E> {
    return false
  }

  /**
   * Returns the contained Ok value.
   *
   * Panics if the result is an Err.
   * @example
   * ```ts
   * const res: Result<number, string> = ok(2)
   * const value: number = res.unwrap() // value is 2
   *
   * const errRes: Result<number, string> = err("fail")
   * errRes.unwrap() // Panics
   * ```
   */
  unwrap(): T {
    return this.value
  }

  /**
   * Returns the contained Ok value or a provided default if the result is an Err.
   * @example
   * ```ts
   * const res: Result<number, string> = ok(2)
   * const value: number = res.unwrapOr(0) // value is 2
   *
   * const errRes: Result<number, string> = err("fail")
   * const defaultValue: number = errRes.unwrapOr(0) // defaultValue is 0
   * ```
   */
  unwrapOr(_default: T): T {
    return this.value
  }

  /**
   * Returns the contained Err value.
   *
   * Panics if the result is an Ok.
   * @example
   * ```ts
   * const res: Result<number, string> = err("fail")
   * const error: string = res.unwrapErr() // error is "fail"
   * ```
   */
  unwrapErr(): never {
    panic(`called \`Result::unwrap_err()\` on an \`Ok\` value: ${this.value}`)
  }

  /**
   * Returns the contained Ok value, or panics with a custom message if the result is an Err.
   * @example
   * ```ts
   * const res: Result<number, string> = ok(2)
   * const value: number = res.expect("Should be ok") // value is 2
   *
   * const errRes: Result<number, string> = err("fail")
   * errRes.expect("Should be ok") // Panics with message "Should be ok: fail"
   * ```
   */
  expect(_message: string): T {
    return this.value
  }

  /**
   * Returns a new Result with the Ok value mapped to a new value.
   * @example
   * ```ts
   * const res1: Result<number, Error> = ok(2)
   * const res2: Result<string, Error> = res1.map((x) => x.toString()) // res2 is Ok("2")
   * ```
   */
  map<U>(fn: (value: T) => U): Result<U, E> {
    return new OkClass(fn(this.value))
  }

  /**
   * Returns a new Result with the Err value mapped to a new error.
   * @example
   * ```ts
   * const res1: Result<number, string> = ok(2)
   * const res2: Result<number, boolean> = res1.mapErr((e) => Boolean(e)) // res2 is still Ok(2)
   * ```
   */
  mapErr<F>(_fn: (err: E) => F): Result<T, F> {
    return new OkClass(this.value)
  }

  /**
   * Calls op if the result is Ok, otherwise returns the Err value of self.
   * This function can be used for control flow based on Result values.
   * @example
   * ```ts
   * const res1: Result<number, string> = ok(2)
   * const res2 = res1.andThen((x) => ok(x * 3)) // res2 is Ok(6)
   *
   * const res3: Result<number, string> = err("error")
   * const res4 = res3.andThen((x) => ok(x * 3)) // res4 is Err("error")
   * ```
   */
  andThen<U>(op: (value: T) => Result<U, E>): Result<U, E> {
    return op(this.value)
  }

  /**
   * Pattern matches on the Result, calling the appropriate function based on whether it's Ok or Err.
   * @example
   * ```ts
   * const res: Result<number, string> = ok(2)
   * const message = res.match({
   *     ok: (value: number) => `Success with value ${value}`,
   *     err: (error: string) => `Failed with error ${error}`,
   * }) // message is "Success with value 2"
   * ```
   */
  match<U>(patterns: { ok: (value: T) => U; err: (error: E) => U }): U {
    return patterns.ok(this.value)
  }

  /**
   * Converts the Result into a Promise.
   * If the Result is Ok, the Promise resolves with the contained value.
   * If the Result is Err, the Promise rejects with the contained error.
   * @example
   * ```ts
   * const res: Result<number, string> = ok(2)
   * const value = await res.asPromise() // value is 2
   *
   * const errRes: Result<number, string> = err("fail")
   * const errValue = await errRes.asPromise() // rejects with "fail"
   * ```
   */
  asPromise(): Promise<T> {
    return Promise.resolve(this.value)
  }

  /**
   * Serializes the Result into a SerializableResult.
   *
   * Note: the value T and error E must be serializable.
   */
  serialize(): SerializableResult<T, E> {
    return { _tag: 'Ok', value: this.value }
  }
}

class ErrClass<T, E> {
  readonly _tag = 'Err'
  constructor(readonly error: E) {}

  /**
   * err value
   * @returns aa
   */
  isOk(): this is OkClass<T, E> {
    return false
  }

  isErr(): this is ErrClass<T, E> {
    return true
  }

  unwrap(): never {
    panic(`called \`Result::unwrap()\` on an \`Err\` value: ${this.error}`)
  }

  unwrapOr(defaultValue: T): T {
    return defaultValue
  }

  unwrapErr(): E {
    return this.error
  }

  expect(message: string): never {
    panic(`${message}: ${this.error}`)
  }

  map<U>(_fn: (value: T) => U): Result<U, E> {
    return this as unknown as Result<U, E>
  }

  mapErr<F>(fn: (err: E) => F): Result<T, F> {
    return new ErrClass(fn(this.error))
  }

  andThen<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
    return new ErrClass(this.error)
  }

  match<U>(patterns: { ok: (value: T) => U; err: (error: E) => U }): U {
    return patterns.err(this.error)
  }

  asPromise(): Promise<T> {
    return Promise.reject(this.error)
  }

  serialize(): SerializableResult<T, E> {
    return { _tag: 'Err', error: this.error }
  }
}
