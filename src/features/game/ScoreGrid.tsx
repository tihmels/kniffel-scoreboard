import type { GameState } from '../../domain/game'
import { grandTotal, upperBonus, upperSubtotal } from '../../domain/game'
import type { DiceRoll, ScoreCategory } from '../../domain/scoring'
import {
  LOWER_CATEGORIES,
  UPPER_CATEGORIES,
  scoringFunctions,
} from '../../domain/scoring'
import { CATEGORY_LABELS } from './labels'
import styles from './ScoreGrid.module.css'

interface ScoreGridProps {
  state: GameState
  dice: DiceRoll
  onRecord: (category: ScoreCategory) => void
}

export function ScoreGrid({ state, dice, onRecord }: ScoreGridProps) {
  const activePlayer =
    state.status === 'playing'
      ? state.players[state.activePlayerIndex]
      : undefined

  function renderCategoryRow(category: ScoreCategory) {
    return (
      <tr key={category}>
        <td className={styles.category}>{CATEGORY_LABELS[category]}</td>
        {state.players.map((player) => {
          const card = state.scores[player.id] ?? {}
          const recorded = card[category]

          if (recorded !== undefined) {
            return (
              <td key={player.id} className={styles.cell}>
                {recorded}
              </td>
            )
          }

          if (activePlayer?.id === player.id) {
            const candidate = scoringFunctions[category](dice)
            return (
              <td key={player.id} className={styles.cell}>
                <button
                  type="button"
                  className={styles.fill}
                  onClick={() => onRecord(category)}
                  aria-label={`Score ${CATEGORY_LABELS[category]} as ${candidate} for ${player.name}`}
                >
                  {candidate}
                </button>
              </td>
            )
          }

          return (
            <td key={player.id} className={styles.open}>
              ·
            </td>
          )
        })}
      </tr>
    )
  }

  function renderTotalRow(
    label: string,
    className: string | undefined,
    value: (playerId: string) => number,
  ) {
    return (
      <tr className={className}>
        <td className={styles.category}>{label}</td>
        {state.players.map((player) => (
          <td key={player.id} className={styles.cell}>
            {value(player.id)}
          </td>
        ))}
      </tr>
    )
  }

  const cardOf = (playerId: string) => state.scores[playerId] ?? {}

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.category}>Category</th>
            {state.players.map((player) => (
              <th
                key={player.id}
                className={activePlayer?.id === player.id ? styles.active : ''}
              >
                {player.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {UPPER_CATEGORIES.map(renderCategoryRow)}
          {renderTotalRow('Upper subtotal', styles.subtotal, (id) =>
            upperSubtotal(cardOf(id)),
          )}
          {renderTotalRow('Bonus (≥ 63)', styles.bonus, (id) =>
            upperBonus(cardOf(id)),
          )}
          {LOWER_CATEGORIES.map(renderCategoryRow)}
          {renderTotalRow('Total', styles.total, (id) =>
            grandTotal(cardOf(id)),
          )}
        </tbody>
      </table>
    </div>
  )
}
