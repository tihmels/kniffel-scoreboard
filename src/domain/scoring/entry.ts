import {
  FIXED_CATEGORY_VALUES,
  FREE_SUM_MAX,
  FREE_SUM_MIN,
  MAX_DICE_PER_CATEGORY,
  UPPER_FACE,
} from './categories'
import type { FixedCategory } from './categories'
import type { CategoryInputKind, ScoreCategory, UpperCategory } from './types'

/*
 * This module models score ENTRY rather than dice scoring: the app is a
 * scorepad, so players announce what they scored and the scorekeeper records
 * it. Every category's legal values form a small enumerable set, which is why
 * the UI never needs a keyboard. See ./scoring.ts for the dice-based rules.
 */

function isUpper(category: ScoreCategory): category is UpperCategory {
  return category in UPPER_FACE
}

function isFixed(category: ScoreCategory): category is FixedCategory {
  return category in FIXED_CATEGORY_VALUES
}

/** Which control a category needs: a 0–5 count, a fixed value, or a free sum. */
export function inputKind(category: ScoreCategory): CategoryInputKind {
  if (isUpper(category)) return 'count'
  if (isFixed(category)) return 'fixed'
  return 'sum'
}

/** Points an upper category earns for `count` dice showing its face. */
export function upperScore(category: UpperCategory, count: number): number {
  return count * UPPER_FACE[category]
}

/** The points a fixed-value category is worth, or `undefined` for other kinds. */
export function fixedValue(category: ScoreCategory): number | undefined {
  return isFixed(category) ? FIXED_CATEGORY_VALUES[category] : undefined
}

/** Every value a category can legally hold, in ascending order (0 = scratched). */
export function allowedScores(category: ScoreCategory): number[] {
  if (isUpper(category)) {
    return Array.from({ length: MAX_DICE_PER_CATEGORY + 1 }, (_, count) =>
      upperScore(category, count),
    )
  }
  if (isFixed(category)) return [0, FIXED_CATEGORY_VALUES[category]]

  const sums = Array.from(
    { length: FREE_SUM_MAX - FREE_SUM_MIN + 1 },
    (_, offset) => FREE_SUM_MIN + offset,
  )
  return [0, ...sums]
}

/**
 * Whether `value` is a legal score for `category`. This is deliberately narrow:
 * it rejects values the category can never hold, but never checks one category
 * against another. Players are trusted about what they rolled.
 */
export function isValidScore(category: ScoreCategory, value: number): boolean {
  if (!Number.isInteger(value)) return false
  return allowedScores(category).includes(value)
}
