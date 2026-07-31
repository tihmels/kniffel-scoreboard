import type {
  DiceRoll,
  DieValue,
  ScoreCategory,
  ScoringFunction,
  UpperCategory,
} from './types'

const UPPER_FACES: Record<UpperCategory, DieValue> = {
  ones: 1,
  twos: 2,
  threes: 3,
  fours: 4,
  fives: 5,
  sixes: 6,
}

/** Sum of all five dice. */
export function sumDice(dice: DiceRoll): number {
  return dice.reduce((total, die) => total + die, 0)
}

/** How many times each face (1..6) appears in the roll. */
export function countFaces(dice: DiceRoll): Record<DieValue, number> {
  const counts: Record<DieValue, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  }
  for (const die of dice) {
    counts[die] += 1
  }
  return counts
}

/** Sum of the dice showing `face`; the basis for every upper-section category. */
export function scoreUpperSection(dice: DiceRoll, face: DieValue): number {
  return dice
    .filter((die) => die === face)
    .reduce((total, die) => total + die, 0)
}

/** Scores the sum of all dice when at least `n` share a face, else 0. */
function scoreNOfAKind(n: number): ScoringFunction {
  return (dice) => {
    const hasN = Object.values(countFaces(dice)).some((count) => count >= n)
    return hasN ? sumDice(dice) : 0
  }
}

/** The distinct faces present in a roll. */
function distinctFaces(dice: DiceRoll): Set<DieValue> {
  return new Set(dice)
}

/**
 * Full house: three of one face and two of another → fixed 25 points.
 * Five of a kind does NOT count as a full house (see rule decision below).
 */
export const scoreFullHouse: ScoringFunction = (dice) => {
  const counts = Object.values(countFaces(dice))
  const isFullHouse = counts.includes(3) && counts.includes(2)
  return isFullHouse ? 25 : 0
}

const SMALL_STRAIGHTS: readonly (readonly DieValue[])[] = [
  [1, 2, 3, 4],
  [2, 3, 4, 5],
  [3, 4, 5, 6],
]

/** Small straight: four consecutive faces → fixed 30 points. */
export const scoreSmallStraight: ScoringFunction = (dice) => {
  const faces = distinctFaces(dice)
  const hasRun = SMALL_STRAIGHTS.some((run) =>
    run.every((face) => faces.has(face)),
  )
  return hasRun ? 30 : 0
}

/** Large straight: five consecutive faces (1–5 or 2–6) → fixed 40 points. */
export const scoreLargeStraight: ScoringFunction = (dice) => {
  const faces = distinctFaces(dice)
  if (faces.size !== 5) return 0
  const hasRun =
    [1, 2, 3, 4, 5].every((face) => faces.has(face as DieValue)) ||
    [2, 3, 4, 5, 6].every((face) => faces.has(face as DieValue))
  return hasRun ? 40 : 0
}

/** Kniffel: five of a kind → fixed 50 points. */
export const scoreKniffel: ScoringFunction = (dice) => {
  const hasFive = Object.values(countFaces(dice)).includes(5)
  return hasFive ? 50 : 0
}

/** Chance: sum of all five dice, regardless of faces. */
export const scoreChance: ScoringFunction = (dice) => sumDice(dice)

/**
 * Complete registry of per-category scoring functions. Each maps a roll to the
 * points it would earn in that category (0 when it does not qualify).
 *
 * Rule variant: STANDARD GERMAN KNIFFEL (see RULE DECISIONS below).
 */
export const scoringFunctions: Record<ScoreCategory, ScoringFunction> = {
  ones: (dice) => scoreUpperSection(dice, UPPER_FACES.ones),
  twos: (dice) => scoreUpperSection(dice, UPPER_FACES.twos),
  threes: (dice) => scoreUpperSection(dice, UPPER_FACES.threes),
  fours: (dice) => scoreUpperSection(dice, UPPER_FACES.fours),
  fives: (dice) => scoreUpperSection(dice, UPPER_FACES.fives),
  sixes: (dice) => scoreUpperSection(dice, UPPER_FACES.sixes),
  threeOfAKind: scoreNOfAKind(3),
  fourOfAKind: scoreNOfAKind(4),
  fullHouse: scoreFullHouse,
  smallStraight: scoreSmallStraight,
  largeStraight: scoreLargeStraight,
  kniffel: scoreKniffel,
  chance: scoreChance,
}

/*
 * RULE DECISIONS — this project uses STANDARD GERMAN KNIFFEL:
 *
 *  - Upper section:    sum of the dice showing the matching face.
 *  - Three/four of a kind: sum of ALL dice when at least 3 / 4 share a face.
 *  - fullHouse:        fixed 25 (a 3-of-a-kind + a distinct pair). Five of a
 *                      kind is NOT a full house here.
 *  - smallStraight:    fixed 30 for four consecutive faces.
 *  - largeStraight:    fixed 40 for five consecutive faces (1–5 or 2–6).
 *  - kniffel:          fixed 50 for five of a kind.
 *  - chance:           sum of all dice.
 *
 * STILL DEFERRED (game-aggregation rules, not per-category — implemented in the
 * game-scoring module, not here):
 *  - Upper-section bonus: +35 when the upper subtotal reaches >= 63.
 *  - Kniffel bonus / Joker rule: +50 for each additional Kniffel, and using an
 *    extra Kniffel as a wildcard in other categories. Requires per-turn history
 *    and is intentionally NOT implemented yet.
 */
