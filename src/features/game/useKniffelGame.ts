import { useReducer } from 'react'
import { gameReducer, initialGameState } from '../../domain/game'

/** Binds the pure game reducer to React state. */
export function useKniffelGame() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState)
  return { state, dispatch }
}
