import { Division, League, RatingData } from '@magic3t/common-types'
import { UserRowElo } from '@magic3t/database-types'
import { RatingConfigModel } from '@magic3t/types'
import { clamp } from 'lodash'

const baseLeagueIndexes = [League.Bronze, League.Silver, League.Gold, League.Diamond]
const TOTAL_BRONZE_LP = 0 * 400
const TOTAL_SILVER_LP = 1 * 400
const TOTAL_GOLD_LP = 2 * 400
const TOTAL_DIAMOND_LP = 3 * 400
const TOTAL_MASTER_LP = 4 * 400

/** Represents a user rating. */
export class RatingConverter {
  constructor(
    public _elo: UserRowElo,
    private config: RatingConfigModel
  ) {}

  public get elo(): UserRowElo {
    return {
      ...this._elo,
    }
  }

  /** Gets the initial progress of the user towards being ranked. */
  public get bo5Progress(): number {
    return this.elo.matches > 5 ? 100 : (this.elo.matches / 5) * 100
  }

  public get provisional(): boolean {
    return this.bo5Progress < 100
  }

  /** Gets how much League Points the user has in total, since the lowest league. */
  public get totalPoints(): number | null {
    if (this.provisional) return null
    const eloAboveBase = this.elo.score - this.config.base_score
    const leaguesAboveBase = eloAboveBase / this.config.league_length
    const leaguesAboveLowest = leaguesAboveBase + this.config.base_league
    const lPAboveLowest = 400 * leaguesAboveLowest
    return lPAboveLowest
  }

  /** Gets how much League Points the user has in their current league+division. */
  public get lp(): number | null {
    const totalPoints = this.totalPoints
    if (totalPoints === null) return null

    if (totalPoints >= TOTAL_MASTER_LP) {
      return totalPoints - TOTAL_MASTER_LP
    }
    return totalPoints % 100
  }

  public get division(): Division | null {
    const totalPoints = this.totalPoints
    if (totalPoints === null) return null
    if (totalPoints >= TOTAL_MASTER_LP) return null
    const pointsAboveDiv4 = totalPoints % 400
    const divsAbove4 = Math.floor(pointsAboveDiv4 / 100)
    return (4 - divsAbove4) as Division
  }

  public get league(): League {
    const totalPoints = this.totalPoints
    if (totalPoints === null) return League.Provisional
    if (totalPoints >= TOTAL_MASTER_LP) {
      if (this.elo.challenger) return League.Challenger
      return League.Master
    }

    const leagueIndex = clamp(Math.floor(totalPoints / 400), 0, 4)
    return baseLeagueIndexes[leagueIndex]
  }

  /** Gets the expected score of this user against an opponent. */
  public expectedScore(opponent: RatingConverter): number {
    const ratingDiff = this.elo.score - opponent.elo.score
    return 1 / (1 + 10 ** (ratingDiff / 400))
  }

  /** Updates the K-factor after a match */
  public updateKFactor(): void {
    if (this.elo.k - this.config.final_k_value < 0.5) {
      this.elo.k = this.config.final_k_value
    }

    this.elo.k =
      this.config.final_k_value * this.config.k_deflation_factor +
      this.elo.k * (1 - this.config.k_deflation_factor)
  }

  /**
   * Updates the ratings of two users based on a match result.
   * @returns The LP gains for both users.
   */
  public updateRatings(opponent: RatingConverter, score: number): [number, number] {
    const [thisPreviousLp, opponentPreviousLp] = [this.lp, opponent.lp]
    const expectedScoreSelf = this.expectedScore(opponent)
    const surpriseFactor = score - expectedScoreSelf // Defines how surprised the system is about the result

    // Update K-factors
    this.updateKFactor()
    opponent.updateKFactor()

    // Update match counters
    this.elo.matches += 1
    opponent.elo.matches += 1

    // Update scores
    this.elo.score += surpriseFactor * this.elo.k
    opponent.elo.score -= surpriseFactor * opponent.elo.k

    const [thisNewLp, opponentNewLp] = [this.lp, opponent.lp]

    // Get the LP gains
    const thisLpGain =
      thisNewLp !== null && thisPreviousLp !== null ? thisNewLp - thisPreviousLp : 0
    const opponentLpGain =
      opponentNewLp !== null && opponentPreviousLp !== null ? opponentNewLp - opponentPreviousLp : 0

    // Remove challenger status if falling below master
    if (this.elo.challenger && thisNewLp && thisNewLp < TOTAL_MASTER_LP) {
      this.elo.challenger = false
    }
    if (opponent.elo.challenger && opponentNewLp && opponentNewLp < TOTAL_MASTER_LP) {
      opponent.elo.challenger = false
    }

    return [thisLpGain, opponentLpGain]
  }

  /** Checks if the user is eligible to be a challenger (has enough LP above Master). */
  public get isChallengerEligible(): boolean {
    const totalLp = this.totalPoints
    if (totalLp === null) return false

    return totalLp >= TOTAL_MASTER_LP + 100
  }

  /** Gets the rating data (league, division, points, progress). */
  // TODO: Optimize it to not repeat getTotalLP calculations
  public get ratingData(): RatingData {
    return {
      league: this.league,
      division: this.division,
      points: this.lp,
      progress: this.bo5Progress,
    }
  }
}
