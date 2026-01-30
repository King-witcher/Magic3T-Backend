import { Module } from '@nestjs/common'
import { DatabaseModule } from '@/infra/database'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
