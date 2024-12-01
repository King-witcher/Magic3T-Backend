import { FirebaseModule } from '@/firebase'
import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'

@Module({
  imports: [FirebaseModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {
  imports: [FirebaseModule]
}
