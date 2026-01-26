import { Division, League, RatingData } from '@magic3t/common-types'
import { UserRowElo } from '@magic3t/database-types'
import { RatingConfigModel } from '@magic3t/types'
import { clamp } from 'lodash'

const leagueIndexes = [League.Bronze, League.Silver, League.Gold, League.Diamond, League.Master]

/**
 * Represents a user rating.
 */
export class RatingObject {
  constructor(
    public readonly elo: UserRowElo,
    private config: RatingConfigModel
  ) {}

  public get isChallenger(): boolean {
    return this.elo.challenger
  }

  public get score(): number {
    return this.elo.score
  }

  public get kValue(): number {
    return this.elo.k
  }

  public get matches(): number {
    return this.elo.matches
  }

  /** Gets how much League Points the user has in total, since the lowest league. */
  public get totalLP(): number {
    const rawLP =
      400 *
      ((this.elo.score - this.config.base_score) / this.config.league_length +
        this.config.base_league)
    return Math.round(rawLP)
  }

  public get ratingData(): RatingData {
    const progress = this.elo.matches > 5 ? 100 : (this.elo.matches / 5) * 100

    if (progress < 100) {
      return {
        league: League.Provisional,
        division: null,
        points: null,
        progress,
      }
    }

    const rawLP = this.totalLP

    // 0 - Bronze
    // 1 - Silver
    // 2 - Gold
    // 3 - Diamond
    // 4 - Master
    const leagueIndex = clamp(Math.floor(rawLP / 400), 0, 4)
    const league = leagueIndexes[leagueIndex]
    const division = (() => {
      if (league === League.Master) return null

      const divsAbove4 = Math.floor((rawLP % 400) / 100)
      return (4 - divsAbove4) as Division
    })()

    const points = (() => {
      if (league === League.Master) return Math.floor(rawLP - 1600)
      return Math.floor(rawLP % 100)
    })()

    return {
      league,
      division,
      points,
      progress: 100,
    }
  }

  public static fromEloToLP(score: number) {
    return 400 * (score / 100)
  }
}
