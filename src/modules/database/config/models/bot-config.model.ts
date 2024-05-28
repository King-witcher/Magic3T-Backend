import { WithId } from '@modules/database/types/withId'

export type BotConfig = { uid: string } & (
  | {
      model: 'lmm'
      depth: number
    }
  | {
      model: 'random'
    }
)

export enum BotName {
  Bot0 = 'bot0',
  Bot1 = 'bot1',
  Bot2 = 'bot2',
  Bot3 = 'bot3',
}

export type BotConfigModel = WithId & Record<BotName, BotConfig>
