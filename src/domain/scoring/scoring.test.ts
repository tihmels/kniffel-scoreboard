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

describe('full house scoring (standard: fixed 25)', () => {
  const fullHouse = scoringFunctions.fullHouse

  it('awards 25 for three of one face and two of another', () => {
    expect(fullHouse([2, 2, 2, 5, 5])).toBe(25)
    expect(fullHouse([6, 6, 1, 1, 1])).toBe(25)
  })

  it('does not count five of a kind as a full house', () => {
    expect(fullHouse([4, 4, 4, 4, 4])).toBe(0)
  })

  it('returns 0 when the pattern is not 3 + 2', () => {
    expect(fullHouse([2, 2, 2, 2, 5])).toBe(0)
    expect(fullHouse([1, 2, 3, 4, 5])).toBe(0)
  })
})

describe('small straight scoring (fixed 30)', () => {
  const smallStraight = scoringFunctions.smallStraight

  it('awards 30 for any four consecutive faces', () => {
    expect(smallStraight([1, 2, 3, 4, 6])).toBe(30)
    expect(smallStraight([2, 3, 4, 5, 5])).toBe(30)
    expect(smallStraight([3, 4, 5, 6, 1])).toBe(30)
  })

  it('returns 0 without four in a row', () => {
    expect(smallStraight([1, 2, 3, 5, 6])).toBe(0)
    expect(smallStraight([1, 1, 1, 1, 1])).toBe(0)
  })
})

describe('large straight scoring (fixed 40)', () => {
  const largeStraight = scoringFunctions.largeStraight

  it('awards 40 for five consecutive faces', () => {
    expect(largeStraight([1, 2, 3, 4, 5])).toBe(40)
    expect(largeStraight([2, 3, 4, 5, 6])).toBe(40)
  })

  it('returns 0 for a small straight only', () => {
    expect(largeStraight([1, 2, 3, 4, 6])).toBe(0)
  })
})

describe('kniffel scoring (fixed 50)', () => {
  const kniffel = scoringFunctions.kniffel

  it('awards 50 for five of a kind', () => {
    expect(kniffel([5, 5, 5, 5, 5])).toBe(50)
  })

  it('returns 0 for four of a kind', () => {
    expect(kniffel([5, 5, 5, 5, 2])).toBe(0)
  })
})
