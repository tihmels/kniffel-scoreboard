import { describe, expect, it } from 'vitest'
import type { DiceRoll } from './types'
import {
  scoreChance,
  scoreUpperSection,
  scoringFunctions,
  sumDice,
} from './scoring'

describe('upper section scoring', () => {
  it('sums only the dice matching the chosen face', () => {
    const dice: DiceRoll = [3, 3, 3, 5, 1]
    expect(scoreUpperSection(dice, 3)).toBe(9)
    expect(scoreUpperSection(dice, 5)).toBe(5)
    expect(scoreUpperSection(dice, 6)).toBe(0)
  })

  it('exposes each face through the registry', () => {
    const dice: DiceRoll = [1, 1, 2, 4, 4]
    expect(scoringFunctions.ones?.(dice)).toBe(2)
    expect(scoringFunctions.fours?.(dice)).toBe(8)
  })
})

describe('n-of-a-kind scoring', () => {
  it('scores the full roll when the count qualifies, else 0', () => {
    const threeSixes: DiceRoll = [6, 6, 6, 2, 1]
    expect(scoringFunctions.threeOfAKind?.(threeSixes)).toBe(21)
    expect(scoringFunctions.fourOfAKind?.(threeSixes)).toBe(0)
  })
})

describe('chance scoring', () => {
  it('always sums all five dice', () => {
    const dice: DiceRoll = [2, 4, 6, 1, 3]
    expect(scoreChance(dice)).toBe(16)
    expect(sumDice(dice)).toBe(16)
  })
})

describe('unimplemented categories', () => {
  it('are absent until a rule variant is chosen', () => {
    expect(scoringFunctions.fullHouse).toBeUndefined()
    expect(scoringFunctions.largeStraight).toBeUndefined()
    expect(scoringFunctions.kniffel).toBeUndefined()
  })
})
