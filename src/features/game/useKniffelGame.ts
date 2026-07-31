import { useEffect, useReducer } from 'react'
import { gameReducer, initialGameState } from '../../domain/game'
import type { GameState } from '../../domain/game'
import { clearGame, loadGame, saveGame } from '../../services/storage'

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

  return { state, dispatch }
}
