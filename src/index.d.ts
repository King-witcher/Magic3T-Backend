declare global {
  namespace Express {
    export interface Request {
      profile: {
        nickname: string
        rating: number
      } | null = null
    }
  }
}

export {}
