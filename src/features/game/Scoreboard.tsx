import type { DiceRoll, ScoreCategory } from '../../domain/scoring'
import { scoringFunctions } from '../../domain/scoring'
import styles from './Scoreboard.module.css'

const CATEGORY_LABELS: Record<ScoreCategory, string> = {
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

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as ScoreCategory[]

// A fixed example roll for this milestone. A real game will manage rolls in state.
const EXAMPLE_ROLL: DiceRoll = [3, 3, 3, 5, 6]

export function Scoreboard() {
  return (
    <section className={styles.card} aria-labelledby="scoreboard-heading">
      <h2 id="scoreboard-heading">Scorecard preview</h2>
      <p className={styles.intro}>
        A static preview wiring the pure scoring domain to the UI. Interactive
        players and turns arrive in the next milestone.
      </p>

      <div
        className={styles.diceRow}
        role="group"
        aria-label="Example dice roll"
      >
        {EXAMPLE_ROLL.map((die, index) => (
          <span key={index} className={styles.die}>
            {die}
          </span>
        ))}
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Category</th>
            <th style={{ textAlign: 'right' }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {CATEGORY_ORDER.map((category) => {
            const scorer = scoringFunctions[category]
            return (
              <tr key={category}>
                <td>{CATEGORY_LABELS[category]}</td>
                <td className={styles.score}>
                  {scorer ? (
                    scorer(EXAMPLE_ROLL)
                  ) : (
                    <span className={styles.pending}>rule TBD</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}
