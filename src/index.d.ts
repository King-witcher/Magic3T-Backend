declare global {
  namespace Express {
    export interface Request {
      session: import('./app/session/session.types').SessionData | null
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      FIREBASE_ADMIN_CREDENTIALS: string
      MAGIC3T_BACKEND_URL: string
      HEARTBEAT_RATE: string
      FIRESTORE_DB: string
      PORT: number
      QUEUE_STATUS_POLLING_RATE: number
    }
  }
}

export {}
