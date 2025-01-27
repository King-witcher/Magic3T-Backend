import { RatingDto, RatingModel } from '@/database'

/** Represents a strategy to convert Rating Model into Rating DTOs */
export abstract class PresentationStrategy {
  abstract getDto(model: RatingModel): Promise<RatingDto>
  abstract convertRatingIntoLp(rating: number): Promise<number>
}
