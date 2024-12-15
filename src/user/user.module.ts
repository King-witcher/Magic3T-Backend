import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { DatabaseModule } from '@/database'
import { AuthModule } from '@/auth/auth.module'

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [UserController],
})
export class UserModule {}
