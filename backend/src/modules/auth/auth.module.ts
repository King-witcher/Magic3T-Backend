import { Global, Module } from '@nestjs/common'
import { FirebaseModule } from '@/infra/firebase'
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
