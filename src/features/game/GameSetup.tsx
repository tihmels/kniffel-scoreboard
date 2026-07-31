import { useState } from 'react'
import type { Dispatch } from 'react'
import type { GameAction, GameState } from '../../domain/game'
import controls from './controls.module.css'
import styles from './GameSetup.module.css'

interface GameSetupProps {
  state: GameState
  dispatch: Dispatch<GameAction>
}

export function GameSetup({ state, dispatch }: GameSetupProps) {
  const [name, setName] = useState('')

  function addPlayer(event: React.FormEvent) {
    event.preventDefault()
    dispatch({ type: 'addPlayer', name })
    setName('')
  }

  return (
    <div>
      <h2>Players</h2>
      <p className={styles.empty}>Add at least one player to start a game.</p>

      <form className={styles.form} onSubmit={addPlayer}>
        <input
          className={styles.input}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Player name"
          aria-label="Player name"
          maxLength={24}
        />
        <button
          type="submit"
          className={controls.button}
          disabled={name.trim() === ''}
        >
          Add
        </button>
      </form>

      {state.players.length > 0 && (
        <ul className={styles.players}>
          {state.players.map((player) => (
            <li key={player.id} className={styles.player}>
              <span>{player.name}</span>
              <button
                type="button"
                className={styles.remove}
                aria-label={`Remove ${player.name}`}
                onClick={() =>
                  dispatch({ type: 'removePlayer', playerId: player.id })
                }
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className={`${controls.button} ${controls.primary}`}
        disabled={state.players.length === 0}
        onClick={() => dispatch({ type: 'startGame' })}
      >
        Start game
      </button>
    </div>
  )
}
