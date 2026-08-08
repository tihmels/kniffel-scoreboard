import type { ScoreCategory } from '../../domain/scoring'

/*
 * German category names, because they are the words players say out loud at the
 * table — matching the announced word to the row label is the scorekeeper's
 * whole task. The domain keys stay English; only the copy is German.
 */
export const CATEGORY_LABELS: Record<ScoreCategory, string> = {
  ones: 'Einser',
  twos: 'Zweier',
  threes: 'Dreier',
  fours: 'Vierer',
  fives: 'Fünfer',
  sixes: 'Sechser',
  threeOfAKind: 'Dreierpasch',
  fourOfAKind: 'Viererpasch',
  fullHouse: 'Full House',
  smallStraight: 'Kleine Straße',
  largeStraight: 'Große Straße',
  kniffel: 'Kniffel',
  chance: 'Chance',
}

/** Short column headers for the 13 × N overview. */
export function initials(name: string): string {
  return name.slice(0, 2).toUpperCase()
}
