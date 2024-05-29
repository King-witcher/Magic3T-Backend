import { Injectable } from '@nestjs/common'
import { RatingStrategy } from './strategies'

@Injectable()
export class RatingService {
  constructor(private readonly ratingStrategy: RatingStrategy) {}

  getRatings(...params: Parameters<RatingStrategy['getRatings']>) {
    return this.ratingStrategy.getRatings(...params)
  }
}
