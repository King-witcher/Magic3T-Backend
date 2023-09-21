import { Registry } from '@/models/Registry'

export interface LocalAuthRequest extends Request {
  user: Registry
}
