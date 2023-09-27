import { Injectable } from '@nestjs/common'
import { AbstractStrategy } from '@nestjs/passport'

@Injectable()
export class PublicStrategy implements AbstractStrategy {
  validate() {
    return true
  }
}
