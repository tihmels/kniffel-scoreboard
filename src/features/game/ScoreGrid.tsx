import {
  bonusRemaining,
  bonusState,
  grandTotal,
  lowerSubtotal,
  upperSubtotal,
} from '../../domain/game'
import type { GameState, ScoreCard } from '../../domain/game'
import {
  LOWER_CATEGORIES,
  UPPER_BONUS,
  UPPER_BONUS_THRESHOLD,
  UPPER_CATEGORIES,
} from '../../domain/scoring'
import type { ScoreCategory } from '../../domain/scoring'
import { CATEGORY_LABELS, initials } from './labels'
import { ScratchMark } from './ScratchMark'
import styles from './ScoreGrid.module.css'

interface ScoreGridProps {
  state: GameState
}

interface TotalCell {
  text: string
  tone?: string | undefined
  /** Still in play, so worth the accent for whoever is up next. */
  pending?: boolean
}

/** Bonus standing as one short cell, so the tensest number stays comparable. */
function bonusCell(card: ScoreCard): TotalCell {
  switch (bonusState(card)) {
    case 'secured':
      return { text: `+${UPPER_BONUS}`, tone: styles.secured }
    case 'missed':
      return { text: '—', tone: styles.faint }
    default:
      return { text: `−${bonusRemaining(card)}`, pending: true }
  }
}

/** The shared 13 × N sheet: everyone's card at once, for comparing standings. */
export function ScoreGrid({ state }: ScoreGridProps) {
  const cardOf = (playerId: string): ScoreCard => state.scores[playerId] ?? {}
  const activeId = state.players[state.activePlayerIndex]?.id

  function renderCategoryRow(category: ScoreCategory) {
    return (
      <tr key={category}>
        <th scope="row" className={styles.category}>
          {CATEGORY_LABELS[category]}
        </th>
        {state.players.map((player) => {
          const value = cardOf(player.id)[category]
          return (
            <td key={player.id} className={styles.cell}>
              {value === undefined ? (
                <span className={styles.open}>·</span>
              ) : value === 0 ? (
                <ScratchMark />
              ) : (
                value
              )}
            </td>
          )
        })}
      </tr>
    )
  }

  function renderTotalRow(
    label: string,
    className: string | undefined,
    render: (card: ScoreCard) => TotalCell | string,
  ) {
    return (
      <tr className={className}>
        <th scope="row" className={styles.category}>
          {label}
        </th>
        {state.players.map((player) => {
          const result = render(cardOf(player.id))
          const cell: TotalCell =
            typeof result === 'string' ? { text: result } : result
          const live = cell.pending === true && player.id === activeId
          return (
            <td
              key={player.id}
              className={`${styles.cell} ${cell.tone ?? ''} ${
                live ? (styles.live ?? '') : ''
              }`}
            >
              {cell.text}
            </td>
          )
        })}
      </tr>
    )
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col" className={styles.category}>
              Kategorie
            </th>
            {state.players.map((player) => (
              <th
                key={player.id}
                scope="col"
                className={`${styles.head} ${
                  player.id === activeId ? styles.live : ''
                }`}
                title={player.name}
              >
                {initials(player.name)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {UPPER_CATEGORIES.map(renderCategoryRow)}
          {renderTotalRow('Zwischensumme', styles.subtotal, (card) =>
            String(upperSubtotal(card)),
          )}
          {renderTotalRow(
            `Bonus ≥ ${UPPER_BONUS_THRESHOLD}`,
            styles.subtotal,
            bonusCell,
          )}
          {LOWER_CATEGORIES.map(renderCategoryRow)}
          {renderTotalRow('Unterer Teil', styles.subtotal, (card) =>
            String(lowerSubtotal(card)),
          )}
          {renderTotalRow('Gesamt', styles.total, (card) =>
            String(grandTotal(card)),
          )}
        </tbody>
      </table>
    </div>
  )
}
