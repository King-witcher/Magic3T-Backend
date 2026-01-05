import { Module } from '@nestjs/common'
import { DatabaseModule } from '@/database'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [DatabaseModule],
})
export class AdminModule {}
