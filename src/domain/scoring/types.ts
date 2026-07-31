/** A single die face. */
export type DieValue = 1 | 2 | 3 | 4 | 5 | 6

/** The five dice a player keeps for scoring a turn. */
export type DiceRoll = readonly [
  DieValue,
  DieValue,
  DieValue,
  DieValue,
  DieValue,
]

/** Upper-section categories: score the sum of dice showing the matching face. */
export type UpperCategory =
  'ones' | 'twos' | 'threes' | 'fours' | 'fives' | 'sixes'

/** Lower-section categories: combination-based scoring. */
export type LowerCategory =
  | 'threeOfAKind'
  | 'fourOfAKind'
  | 'fullHouse'
  | 'smallStraight'
  | 'largeStraight'
  | 'kniffel'
  | 'chance'

export type ScoreCategory = UpperCategory | LowerCategory

/**
 * Pure scoring function for a single category. Returns the points earned, or
 * `0` when the roll does not satisfy the category. It never mutates its input.
 */
export type ScoringFunction = (dice: DiceRoll) => number
