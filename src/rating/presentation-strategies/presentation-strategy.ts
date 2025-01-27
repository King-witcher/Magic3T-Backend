import { RatingDto, RatingModel } from '@/database'

export abstract class PresentationStrategy {
  abstract getDto(model: RatingModel): Promise<RatingDto>
}
