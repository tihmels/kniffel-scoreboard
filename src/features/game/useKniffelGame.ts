import { useEffect, useReducer } from 'react'
import { gameReducer, initialGameState } from '../../domain/game'
import type { GameState } from '../../domain/game'
import {
  clearGame,
  loadGame,
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

  // Names are worth keeping past the game itself: the same group plays again,
  // and re-typing four names is the slowest thing in the app.
  useEffect(() => {
    if (state.status === 'playing') {
      rememberNames(state.players.map((player) => player.name))
    }
  }, [state.status, state.players])

  return { state, dispatch }
}
