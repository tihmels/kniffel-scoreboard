import type { LowerCategory, ScoreCategory, UpperCategory } from './types'

/** Upper-section categories, in scorecard order. */
export const UPPER_CATEGORIES: readonly UpperCategory[] = [
  'ones',
  'twos',
  'threes',
  'fours',
  'fives',
  'sixes',
]

/** Lower-section categories, in scorecard order. */
export const LOWER_CATEGORIES: readonly LowerCategory[] = [
  'threeOfAKind',
  'fourOfAKind',
  'fullHouse',
  'smallStraight',
  'largeStraight',
  'kniffel',
  'chance',
]

/** All 13 categories, in scorecard order. */
export const SCORE_CATEGORIES: readonly ScoreCategory[] = [
  ...UPPER_CATEGORIES,
  ...LOWER_CATEGORIES,
]

/** Upper section earns a bonus once its subtotal reaches this threshold. */
export const UPPER_BONUS_THRESHOLD = 63

/** Points awarded when the upper subtotal reaches the threshold. */
export const UPPER_BONUS = 35
