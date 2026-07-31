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

/** Chance: sum of all five dice, regardless of faces. */
export const scoreChance: ScoringFunction = (dice) => sumDice(dice)

/**
 * Registry of categories whose scoring is unambiguous across the common
 * Kniffel/Yahtzee rule variants. This is deliberately a `Partial` record:
 * variant-dependent categories are declared in the type system but left
 * unimplemented until a rule decision is made — see OPEN RULE DECISIONS below.
 */
export const scoringFunctions: Partial<Record<ScoreCategory, ScoringFunction>> =
  {
    ones: (dice) => scoreUpperSection(dice, UPPER_FACES.ones),
    twos: (dice) => scoreUpperSection(dice, UPPER_FACES.twos),
    threes: (dice) => scoreUpperSection(dice, UPPER_FACES.threes),
    fours: (dice) => scoreUpperSection(dice, UPPER_FACES.fours),
    fives: (dice) => scoreUpperSection(dice, UPPER_FACES.fives),
    sixes: (dice) => scoreUpperSection(dice, UPPER_FACES.sixes),
    threeOfAKind: scoreNOfAKind(3),
    fourOfAKind: scoreNOfAKind(4),
    chance: scoreChance,
  }

/*
 * OPEN RULE DECISIONS (must be resolved before implementing the remaining
 * categories — the choice changes scoring behaviour, so it is not guessed here):
 *
 *  - fullHouse:     fixed 25 points (standard German Kniffel) vs. sum-of-dice
 *                   (some house rules). Also: does "two of a kind + three of a
 *                   kind" of the SAME face (a Kniffel) count as a full house?
 *  - smallStraight: fixed 30 points for four consecutive faces (standard) vs.
 *                   sum-based variants.
 *  - largeStraight: fixed 40 points for five consecutive faces (standard) vs.
 *                   sum-based variants.
 *  - kniffel:       fixed 50 points for five of a kind.
 *  - Kniffel bonus / Joker rule: extra 50 points for each additional Kniffel,
 *                   and whether an extra Kniffel may be used as a wildcard in
 *                   other categories. This affects turn/game aggregation, not a
 *                   single category, and belongs to a future game-scoring module.
 *  - Upper-section bonus: +35 points when the upper section totals >= 63.
 *                   Also an aggregation-level rule, not a per-category one.
 */
