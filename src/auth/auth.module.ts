import { FirebaseModule } from '@/firebase'
import { Global, Module } from '@nestjs/common'
import { AuthService } from './auth.service'

@Global()
@Module({
  imports: [FirebaseModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {
  imports: [FirebaseModule]
}
