import { useEffect, useReducer, useRef } from 'react'
import { gameReducer, initialGameState, toGameRecord } from '../../domain/game'
import type { GameState } from '../../domain/game'
import {
  clearGame,
  loadGame,
  rememberFinishedGame,
  rememberNames,
  saveGame,
} from '../../services/storage'

function initGameState(): GameState {
  return loadGame() ?? initialGameState
}

/** Binds the pure game reducer to React state, persisted to localStorage. */
export function useKniffelGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initGameState)

  useEffect(() => {
    if (state.status === 'setup' && state.players.length === 0) {
      clearGame()
    } else {
      saveGame(state)
    }
  }, [state])

  // Filling the last cell is the one moment a game is worth archiving, and it
  // happens exactly once: the standings screen offers no undo, so `finished` is
  // terminal until a rematch or a new game starts the cycle over. A game
  // restored from storage was already archived when it finished.
  const archived = useRef(state.status === 'finished')
  useEffect(() => {
    if (state.status !== 'finished') {
      archived.current = false
      return
    }
    if (archived.current) return
    archived.current = true
    rememberFinishedGame(toGameRecord(state))
  }, [state])

  // Names are worth keeping past the game itself: the same group plays again,
  // and re-typing four names is the slowest thing in the app.
  useEffect(() => {
    if (state.status === 'playing') {
      rememberNames(state.players.map((player) => player.name))
    }
  }, [state.status, state.players])

  return { state, dispatch }
}
