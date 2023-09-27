import { CanActivate, Injectable } from '@nestjs/common'

@Injectable()
export class NullGuard implements CanActivate {
  canActivate() {
    return true
  }
}
