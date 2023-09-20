export type SessionData = {
  readonly id: string
  expires: number
  readonly profile: {
    readonly nickname: string
    readonly rating: number
  }
}

export type SessionMap = { [id: string]: SessionData }
