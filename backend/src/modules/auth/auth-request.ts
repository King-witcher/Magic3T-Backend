import { Request } from 'express'

export interface AuthenticRequest extends Request {
  userId: string
}
