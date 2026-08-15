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

const MIN_LABEL = 2
const MAX_LABEL = 4

function clip(name: string, width: number): string {
  return name.trim().slice(0, width).toUpperCase()
}

/**
 * Short column headers for the 13 × N overview. Two letters is enough for a
 * small table, but at a full one "Marie" and "Martin" both read MA — and the
 * grid is the screen where a scorekeeper checks whether the right person got
 * the points, so an ambiguous header is worse than a wide one. Every label
 * therefore shares the narrowest width that tells all of them apart.
 */
export function shortLabels(names: string[]): string[] {
  for (let width = MIN_LABEL; width <= MAX_LABEL; width += 1) {
    const labels = names.map((name) => clip(name, width))
    if (new Set(labels).size === labels.length) return labels
  }

  // Two players really are called the same thing. The seat number is the only
  // thing left, and it matches the position they were given during setup.
  const widest = names.map((name) => clip(name, MAX_LABEL))
  return widest.map((label, index) =>
    widest.filter((other) => other === label).length > 1
      ? `${clip(label, MIN_LABEL)}${index + 1}`
      : label,
  )
}
