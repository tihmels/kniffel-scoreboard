import { useState } from 'react'
import type { Dispatch } from 'react'
import type { GameAction, GameState } from '../../domain/game'
import { loadHistory, loadRecentNames } from '../../services/storage'
import { AppBar } from './AppBar'
import { HistoryScreen } from './HistoryScreen'
import styles from './GameSetup.module.css'

/**
 * A full table. Beyond eight the standings strip needs a third row above the
 * score rows, and the overview grid drops below a legible column per player.
 */
const MAX_PLAYERS = 8

interface GameSetupProps {
  state: GameState
  dispatch: Dispatch<GameAction>
}

/**
 * The only screen with a keyboard, and even here it is optional: remembered
 * names are one tap, and an unnamed player gets a default.
 */
export function GameSetup({ state, dispatch }: GameSetupProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [recent] = useState(loadRecentNames)
  const [played] = useState(loadHistory)
  const [showHistory, setShowHistory] = useState(false)

  const taken = new Set(state.players.map((player) => player.name))
  const suggestions = recent.filter((name) => !taken.has(name))
  const full = state.players.length >= MAX_PLAYERS

  function addPlayer(name: string) {
    if (full) return
    dispatch({ type: 'addPlayer', name })
  }

  function commitRename(playerId: string) {
    if (draft.trim() !== '') {
      dispatch({ type: 'renamePlayer', playerId, name: draft })
    }
    setEditingId(null)
  }

  if (showHistory) {
    return <HistoryScreen onClose={() => setShowHistory(false)} />
  }

  return (
    <div className={styles.screen}>
      <AppBar
        title="Neues Spiel"
        actions={
          played.length > 0 && (
            <button
              type="button"
              className={styles.history}
              onClick={() => setShowHistory(true)}
            >
              Letzte Spiele
            </button>
          )
        }
      />

      <div className={styles.body}>
        {suggestions.length > 0 && (
          <section className={styles.block}>
            <h2 className={styles.label}>Zuletzt gespielt</h2>
            <div className={styles.chips}>
              {suggestions.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={styles.chip}
                  disabled={full}
                  onClick={() => addPlayer(name)}
                >
                  {name} +
                </button>
              ))}
            </div>
          </section>
        )}

        <section className={styles.block}>
          <div className={styles.blockHead}>
            <h2 className={styles.label}>Spieler · Reihenfolge</h2>
            <span className={styles.count}>
              {state.players.length} von {MAX_PLAYERS}
            </span>
          </div>

          <ul className={styles.players}>
            {state.players.map((player, index) => (
              <li key={player.id} className={styles.player}>
                <span className={styles.seat}>{index + 1}</span>

                {editingId === player.id ? (
                  <input
                    className={styles.input}
                    value={draft}
                    autoFocus
                    maxLength={24}
                    aria-label={`${player.name} umbenennen`}
                    onChange={(event) => setDraft(event.target.value)}
                    onBlur={() => commitRename(player.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') commitRename(player.id)
                      if (event.key === 'Escape') setEditingId(null)
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    className={styles.name}
                    onClick={() => {
                      setEditingId(player.id)
                      setDraft(player.name)
                    }}
                  >
                    {player.name}
                  </button>
                )}

                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label={`${player.name} nach oben`}
                  disabled={index === 0}
                  onClick={() =>
                    dispatch({
                      type: 'movePlayer',
                      playerId: player.id,
                      offset: -1,
                    })
                  }
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label={`${player.name} entfernen`}
                  onClick={() =>
                    dispatch({ type: 'removePlayer', playerId: player.id })
                  }
                >
                  ✕
                </button>
              </li>
            ))}

            {!full && (
              <li>
                <button
                  type="button"
                  className={styles.add}
                  onClick={() =>
                    addPlayer(`Spieler ${state.players.length + 1}`)
                  }
                >
                  + Spieler {state.players.length + 1}
                </button>
              </li>
            )}
          </ul>
        </section>
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.start}
          disabled={state.players.length === 0}
          onClick={() => dispatch({ type: 'startGame' })}
        >
          Spiel starten
        </button>
      </div>
    </div>
  )
}
