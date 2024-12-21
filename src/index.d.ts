import type { Result as ResultClass } from './lib/rust/result'

declare global {
  namespace Express {
    export interface Request {
      session: import('./app/session/session.types').SessionData | null
    }
  }

  type Result<T, E> = ResultClass<T, E>

  function Ok<T, E>(data: T): ResultClass<T, E>
  function Err<T, E>(error: E): ResultClass<T, E>

  namespace NodeJS {
    interface ProcessEnv {
      FIREBASE_ADMIN_CREDENTIALS: string
      QUEUE_ITERATE_TIME: string
      MAGIC3T_BACKEND_URL: string
      HEARTBEAT_RATE: string
    }
  }
}
