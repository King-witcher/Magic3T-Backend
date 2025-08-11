import { Channel } from '@/common/utils/channel'
import { MatchEventType } from '@/match/lib/match'
import { Choice, MatchState, Team } from '@magic3t/types'
import { Perspective } from '../lib/perspective'

export abstract class BaseBot {
  private channel: Channel<MatchState> = new Channel<MatchState>()
  private started = false

  constructor(private perspective: Perspective) {
    const callback = () => {
      const state = perspective.getStateReport()
      this.channel.send(state)
    }

    perspective.on(MatchEventType.Start, callback)
    perspective.on(MatchEventType.Choice, callback)
    perspective.on(MatchEventType.Finish, callback)
  }

  async start(): Promise<void> {
    if (this.started) {
      console.error('Bot already started')
      return
    }
    this.started = true

    while (true) {
      const state = await this.channel.receive()
      if (state.finished) break
      if (state.turn !== this.perspective.team) continue

      const choice = await this.think(state, this.perspective.team)
      this.perspective.pick(choice)
    }
  }

  protected abstract think(state: MatchState, team: Team): Promise<Choice>
}
