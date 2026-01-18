import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@/database'
import { RatingService } from './rating.service'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [RatingService],
  exports: [RatingService],
})
export class RatingModule {}
