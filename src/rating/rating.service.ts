import { Injectable } from '@nestjs/common'
import { RatingDto, RatingModel } from '@/database'
import { UpdatingStrategy } from './updating-strategies'
import { PresentationStrategy } from './presentation-strategies'

@Injectable()
export class RatingService {
  constructor(
    private updatingStrategy: UpdatingStrategy,
    private presentationStrategy: PresentationStrategy
  ) {}

  getRatings(...params: Parameters<UpdatingStrategy['getNewRatings']>) {
    return this.updatingStrategy.getNewRatings(...params)
  }

  async getRatingDto(ratingModel: RatingModel): Promise<RatingDto> {
    return this.presentationStrategy.getDto(ratingModel)
  }
}
