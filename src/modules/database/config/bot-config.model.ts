import { WithId } from '@modules/database/types/withId'

type BotModel = { uid: string } & (
  | {
      model: 'lmm'
      depth: number
    }
  | {
      model: 'random'
    }
)

export enum BotNames {
  Bot0 = 'bot0',
  Bot1 = 'bot1',
  Bot2 = 'bot2',
  Bot3 = 'bot3',
}

export type BotConfigModel = WithId & Record<BotNames, BotModel>
