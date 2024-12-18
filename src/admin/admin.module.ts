import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { DatabaseModule } from '@/database'
import { AuthModule } from '@/auth/auth.module'

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [AuthModule, DatabaseModule],
})
export class AdminModule {}
