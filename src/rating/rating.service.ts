import { RatingDto, RatingModel } from '@/database'
import { Injectable } from '@nestjs/common'
import { PresentationStrategy } from './presentation-strategies'
import { UpdatingStrategy } from './updating-strategies'

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
