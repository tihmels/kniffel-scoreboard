import { useState } from 'react'
import type { Dispatch } from 'react'
import {
  TOTAL_ROUNDS,
  bonusState,
  grandTotal,
  standings,
  winners,
} from '../../domain/game'
import type { GameAction, GameState } from '../../domain/game'
import { UPPER_BONUS } from '../../domain/scoring'
import { AppBar } from './AppBar'
import { OverviewScreen } from './OverviewScreen'
import styles from './FinalStandings.module.css'

interface FinalStandingsProps {
  state: GameState
  dispatch: Dispatch<GameAction>
}

export function FinalStandings({ state, dispatch }: FinalStandingsProps) {
  const [showOverview, setShowOverview] = useState(false)

  if (showOverview) {
    return (
      <OverviewScreen state={state} onClose={() => setShowOverview(false)} />
    )
  }

  const ranked = standings(state)
  const best = winners(state)
  const tied = best.length > 1
  const topScore = grandTotal(state.scores[ranked[0]?.id ?? ''] ?? {})
  const runnerUp = ranked[best.length]
  const margin = runnerUp
    ? topScore - grandTotal(state.scores[runnerUp.id] ?? {})
    : 0

  return (
    <div className={styles.screen}>
      <AppBar
        title="Spiel beendet"
        detail={`${TOTAL_ROUNDS} von ${TOTAL_ROUNDS}`}
      />

      <div className={styles.body}>
        <div className={styles.crown}>
          <div className={styles.label}>
            {tied ? 'Unentschieden' : 'Sieger'}
          </div>
          <div className={styles.winner}>
            {best.map((player) => player.name).join(' & ')}
          </div>
          <div className={styles.detail}>
            {topScore} Punkte
            {!tied && runnerUp && ` · ${margin} Vorsprung`}
          </div>
        </div>

        <ol className={styles.list}>
          {ranked.map((player, index) => {
            const card = state.scores[player.id] ?? {}
            const secured = bonusState(card) === 'secured'
            return (
              <li
                key={player.id}
                className={`${styles.row} ${index === 0 ? styles.top : ''}`}
              >
                <span className={styles.rank}>{index + 1}</span>
                <span className={styles.name}>{player.name}</span>
                <span className={secured ? styles.bonus : styles.noBonus}>
                  {secured ? `+${UPPER_BONUS}` : '—'}
                </span>
                <span className={styles.total}>{grandTotal(card)}</span>
              </li>
            )
          })}
        </ol>

        <button
          type="button"
          className={styles.sheet}
          onClick={() => setShowOverview(true)}
        >
          Blatt ansehen
        </button>
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.rematch}
          onClick={() => dispatch({ type: 'rematch' })}
        >
          Revanche — gleiche Runde
        </button>
        <button
          type="button"
          className={styles.newGame}
          onClick={() => dispatch({ type: 'reset' })}
        >
          Neues Spiel
        </button>
      </div>
    </div>
  )
}
