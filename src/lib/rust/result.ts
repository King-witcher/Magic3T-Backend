enum ResultTag {
  Ok = 0,
  Err = 1,
}

export class Result<T, E> {
  private constructor(
    private tag: ResultTag,
    private data: T | E
  ) {}

  is_ok() {
    return this.tag === ResultTag.Ok
  }
  is_err() {
    return this.tag === ResultTag.Err
  }

  static Ok<T, E>(data: T): Result<T, E> {
    return new Result<T, E>(ResultTag.Ok, data)
  }

  static Err<T, E>(data: E): Result<T, E> {
    return new Result<T, E>(ResultTag.Err, data)
  }

  match<MatchResult>(
    okCallback: (data: T) => MatchResult,
    errCallback: (error: E) => MatchResult
  ): MatchResult {
    if (this.is_ok()) return okCallback(this.data as unknown as T)
    return errCallback(this.data as E)
  }
}

export const Ok = Result.Ok
export const Err = Result.Err
