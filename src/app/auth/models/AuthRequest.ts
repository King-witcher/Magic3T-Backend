import { Registry } from '@/models/Registry'

export interface AuthRequest extends Request {
  user: Registry
}
