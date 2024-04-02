import { Module } from '@nestjs/common'
import { MatchGateway } from './match.gateway'
import { MatchService } from './match.service'
import { SocketsService } from '../sockets.service'
import { PlayerEmitType } from './types/PlayerSocket'
import { MatchController } from './match.controller'
import { FirebaseService } from '@modules/firebase/firebase.service'

@Module({
  controllers: [MatchController],
  providers: [
    MatchGateway,
    MatchService,
    SocketsService<PlayerEmitType>,
    FirebaseService,
  ],
  exports: [MatchService],
})
export class MatchModule {}
