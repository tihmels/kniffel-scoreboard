import type {
  DieValue,
  LowerCategory,
  ScoreCategory,
  UpperCategory,
} from './types'

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

/** The die face each upper-section category collects. */
export const UPPER_FACE: Record<UpperCategory, DieValue> = {
  ones: 1,
  twos: 2,
  threes: 3,
  fours: 4,
  fives: 5,
  sixes: 6,
}

/** Lower-section categories worth a fixed number of points when scored. */
export const FIXED_CATEGORY_VALUES = {
  fullHouse: 25,
  smallStraight: 30,
  largeStraight: 40,
  kniffel: 50,
} as const satisfies Partial<Record<LowerCategory, number>>

export type FixedCategory = keyof typeof FIXED_CATEGORY_VALUES

/** Categories scored as the sum of all five dice. */
export const FREE_SUM_CATEGORIES = [
  'threeOfAKind',
  'fourOfAKind',
  'chance',
] as const satisfies readonly LowerCategory[]

export type FreeSumCategory = (typeof FREE_SUM_CATEGORIES)[number]

/** Lowest and highest sum five dice can show. */
export const FREE_SUM_MIN = 5
export const FREE_SUM_MAX = 30

/** Most dice a single category can collect in one turn. */
export const MAX_DICE_PER_CATEGORY = 5
