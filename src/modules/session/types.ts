export type Session = {
  readonly ssid: string
  readonly profile: {
    readonly nickname: string
    readonly rating: number
  }
  expires: number
}

export type SessionMap = { [ssid: string]: Session }
