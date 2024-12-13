declare global {
  namespace Express {
    export interface Request {
      session: import('./app/session/session.types').SessionData | null
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      FIREBASE_ADMIN_CREDENTIALS: string
      QUEUE_ITERATE_TIME: string
      MAGIC3T_BACKEND_URL: string
      REUP_RATE: string
    }
  }
}

export {}
