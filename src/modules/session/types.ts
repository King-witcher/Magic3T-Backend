export type Session = {
  token: string
  userId: number
  expires: number
}

export type SessionMap = { [key: string]: Session }