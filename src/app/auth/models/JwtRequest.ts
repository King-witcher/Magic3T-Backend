import { UserFromJwt } from './UserFromJwt'

export interface JwtRequest extends Request {
  user: UserFromJwt
}
