import { faker } from '@faker-js/faker'
import { Choice, Team, UserRow } from '@magic3t/types'
import { delay } from '@/common'
import { Match, MatchEventType } from './match'

function createMatch(): Match {
  return new Match({
    timelimit: 400,
    [Team.Order]: {} as UserRow,
    [Team.Chaos]: {} as UserRow,
  })
}

describe(Match, () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have turn = order after start', () => {
    const match = createMatch()
    match.start()

    expect(match.turn).toBe(Team.Order)
  })

  it('should handle properly when someone wins the match by Magic3T tuple', () => {
    const mock = vi.fn()
    const match = createMatch()
    match.on(MatchEventType.Finish, mock)
    match.start()

    match.handleChoice(Team.Order, 5)
    match.handleChoice(Team.Chaos, 7)
    match.handleChoice(Team.Order, 1)
    match.handleChoice(Team.Chaos, 8)

    expect(mock).toHaveBeenCalledTimes(0)

    match.handleChoice(Team.Order, 9)

    expect(mock).toHaveBeenCalledTimes(1)
    expect(mock).toHaveBeenCalledWith(match, Team.Order)
    expect(match.winner).toBe(Team.Order)
    expect(match.finished).toBe(true)
    expect(match.turn).toBeNull()
    expect(match.getFinalScore(Team.Order)).toBe(1)
    expect(match.getFinalScore(Team.Chaos)).toBe(0)
  })

  it('should handle properly when the match draws', async () => {
    vi.useRealTimers()
    const mock = vi.fn()
    const match = createMatch()
    match.on(MatchEventType.Finish, mock)
    match.start()

    match.handleChoice(Team.Order, 2)
    await delay(10)
    match.handleChoice(Team.Chaos, 5)
    await delay(10)
    match.handleChoice(Team.Order, 8)
    match.handleChoice(Team.Chaos, 7)
    match.handleChoice(Team.Order, 3)
    match.handleChoice(Team.Chaos, 4)
    match.handleChoice(Team.Order, 6)
    match.handleChoice(Team.Chaos, 1)
    match.handleChoice(Team.Order, 9)

    expect(mock).toHaveBeenCalledTimes(1)
    expect(mock).toHaveBeenCalledWith(match, null)
    expect(match.winner).toBe(null)
    expect(match.finished).toBe(true)
    expect(match.turn).toBeNull()
    expect(match.getFinalScore(Team.Order)).toBeLessThan(0.7)
    expect(match.getFinalScore(Team.Chaos)).toBeLessThan(0.7)
    expect(match.getFinalScore(Team.Order)).toBeGreaterThan(0.3)
    expect(match.getFinalScore(Team.Chaos)).toBeGreaterThan(0.3)
  })

  describe('start', () => {
    it('should dispatch a start event', () => {
      const mock = vi.fn()
      const match = createMatch()
      match.on(MatchEventType.Start, mock)

      match.start()

      expect(mock).toHaveBeenCalledTimes(1)
    })

    it('should throw if called twice', () => {
      const match = createMatch()
      match.start()

      expect(() => match.start()).toThrowError('panic: called start() twice')
    })
  })

  describe('handleChoice', () => {
    it("should return err if it is not the team's turn", () => {
      const match = createMatch()
      match.start()

      const result = match.handleChoice(Team.Chaos, 4)
      expect(result.isErr()).toBe(true)
    })

    it('should dispatch a choice event', () => {
      const mock = vi.fn()
      const match = createMatch()
      match.on(MatchEventType.Choice, mock)
      match.start()
      const choice = faker.number.int({ min: 1, max: 9 }) as Choice

      const result = match.handleChoice(Team.Order, choice)

      expect(result.isOk()).toBe(true)
      expect(mock).toHaveBeenCalledTimes(1)
      expect(mock).toHaveBeenCalledWith(Team.Order, choice, expect.any(Number))
    })

    it('should switch turns after a choice', () => {
      const match = createMatch()
      match.start()

      const choice = faker.number.int({ min: 1, max: 9 }) as Choice
      match.handleChoice(Team.Order, choice)

      expect(match.turn).toBe(Team.Chaos)
    })
  })
})
