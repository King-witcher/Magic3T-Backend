import type { WithId } from '../with-id'

export type BotConfig = { uid: string } & (
  | {
      model: 'lmm'
      depth: number
    }
  | {
      model: 'random'
    }
)

export const enum BotName {
  Bot0 = 'bot0',
  Bot1 = 'bot1',
  Bot2 = 'bot2',
  Bot3 = 'bot3',
}

export type BotConfigRow = WithId<'bots'> & Record<BotName, BotConfig>
