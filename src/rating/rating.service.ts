import { Injectable } from '@nestjs/common'
import { UpdatingStrategy } from './strategies'

@Injectable()
export class RatingService {
  constructor(private readonly ratingStrategy: UpdatingStrategy) {}

  getRatings(...params: Parameters<UpdatingStrategy['getNewRatings']>) {
    return this.ratingStrategy.getNewRatings(...params)
  }
}
