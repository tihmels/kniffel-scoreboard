import { useState } from 'react'
import { winners } from '../../domain/game'
import type { DiceRoll, ScoreCategory } from '../../domain/scoring'
import controls from './controls.module.css'
import { DiceInput } from './DiceInput'
import { GameSetup } from './GameSetup'
import { ScoreGrid } from './ScoreGrid'
import styles from './Scoreboard.module.css'
import { useKniffelGame } from './useKniffelGame'

const STARTING_DICE: DiceRoll = [1, 1, 1, 1, 1]

export function Scoreboard() {
  const { state, dispatch } = useKniffelGame()
  const [dice, setDice] = useState<DiceRoll>(STARTING_DICE)

  if (state.status === 'setup') {
    return (
      <section className={styles.card}>
        <GameSetup state={state} dispatch={dispatch} />
      </section>
    )
  }

  const activePlayer = state.players[state.activePlayerIndex]

  function recordScore(category: ScoreCategory) {
    if (!activePlayer) return
    dispatch({ type: 'recordScore', playerId: activePlayer.id, category, dice })
    setDice(STARTING_DICE)
  }

  return (
    <section className={styles.card}>
      {state.status === 'playing' && activePlayer && (
        <>
          <p className={styles.turn}>
            Now playing:{' '}
            <span className={styles.turnName}>{activePlayer.name}</span>
          </p>
          <DiceInput dice={dice} onChange={setDice} />
          <p className={styles.hint}>
            Enter the dice you rolled, then tap a score in the{' '}
            <strong>{activePlayer.name}</strong> column to fill that category.
          </p>
        </>
      )}

      {state.status === 'finished' && (
        <div className={styles.banner}>
          <span className={styles.winner}>
            🏆{' '}
            {winners(state)
              .map((player) => player.name)
              .join(' & ')}{' '}
            {winners(state).length > 1 ? 'tie!' : 'wins!'}
          </span>
          <button
            type="button"
            className={`${controls.button} ${controls.primary}`}
            onClick={() => dispatch({ type: 'reset' })}
          >
            New game
          </button>
        </div>
      )}

      <div className={styles.grid}>
        <ScoreGrid state={state} dice={dice} onRecord={recordScore} />
      </div>
    </section>
  )
}
