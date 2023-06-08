declare global {
  namespace Express {
    export interface Request {
      session: import('./app/session/session.types').SessionData | null
    }
  }
}

export {}
