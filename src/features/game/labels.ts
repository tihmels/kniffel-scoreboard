import type { ScoreCategory } from '../../domain/scoring'

export const CATEGORY_LABELS: Record<ScoreCategory, string> = {
  ones: 'Ones',
  twos: 'Twos',
  threes: 'Threes',
  fours: 'Fours',
  fives: 'Fives',
  sixes: 'Sixes',
  threeOfAKind: 'Three of a kind',
  fourOfAKind: 'Four of a kind',
  fullHouse: 'Full house',
  smallStraight: 'Small straight',
  largeStraight: 'Large straight',
  kniffel: 'Kniffel',
  chance: 'Chance',
}
