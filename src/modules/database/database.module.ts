import { Module } from '@nestjs/common'
import { UsersService } from './users/users.service'
import { DatabaseService } from './database.service'
import { FirebaseModule } from '@modules/firebase/firebase.module'
import { MatchesService } from './matches/matches.service';

@Module({
  imports: [FirebaseModule],
  providers: [DatabaseService, UsersService, MatchesService],
  exports: [UsersService],
})
export class DatabaseModule {}
