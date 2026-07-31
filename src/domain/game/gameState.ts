import {
  LOWER_CATEGORIES,
  SCORE_CATEGORIES,
  UPPER_BONUS,
  UPPER_BONUS_THRESHOLD,
  UPPER_CATEGORIES,
  scoringFunctions,
} from '../scoring'
import type { GameAction, GameState, Player, ScoreCard } from './types'

export const initialGameState: GameState = {
  status: 'setup',
  players: [],
  scores: {},
  activePlayerIndex: 0,
}

function createPlayer(name: string): Player {
  return { id: crypto.randomUUID(), name }
}

function sumCategories(
  card: ScoreCard,
  categories: readonly (keyof ScoreCard)[],
): number {
  return categories.reduce(
    (total, category) => total + (card[category] ?? 0),
    0,
  )
}

/** Sum of the upper-section categories (before any bonus). */
export function upperSubtotal(card: ScoreCard): number {
  return sumCategories(card, UPPER_CATEGORIES)
}

/** 35 once the upper subtotal reaches 63, else 0. */
export function upperBonus(card: ScoreCard): number {
  return upperSubtotal(card) >= UPPER_BONUS_THRESHOLD ? UPPER_BONUS : 0
}

/** Sum of the lower-section categories. */
export function lowerSubtotal(card: ScoreCard): number {
  return sumCategories(card, LOWER_CATEGORIES)
}

/** Final score for a card: upper subtotal + upper bonus + lower subtotal. */
export function grandTotal(card: ScoreCard): number {
  return upperSubtotal(card) + upperBonus(card) + lowerSubtotal(card)
}

/** Every category has been filled. */
export function isCardComplete(card: ScoreCard): boolean {
  return SCORE_CATEGORIES.every((category) => category in card)
}

/** All players have completed their scorecards. */
export function isGameComplete(state: GameState): boolean {
  return (
    state.players.length > 0 &&
    state.players.every((player) =>
      isCardComplete(state.scores[player.id] ?? {}),
    )
  )
}

/** Players with the highest grand total (more than one when tied). */
export function winners(state: GameState): Player[] {
  if (state.players.length === 0) return []
  const totals = state.players.map((player) =>
    grandTotal(state.scores[player.id] ?? {}),
  )
  const best = Math.max(...totals)
  return state.players.filter((_, index) => totals[index] === best)
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'addPlayer': {
      if (state.status !== 'setup') return state
      const name = action.name.trim()
      if (name === '') return state
      const player = createPlayer(name)
      return {
        ...state,
        players: [...state.players, player],
        scores: { ...state.scores, [player.id]: {} },
      }
    }

    case 'removePlayer': {
      if (state.status !== 'setup') return state
      const scores = { ...state.scores }
      delete scores[action.playerId]
      return {
        ...state,
        players: state.players.filter((p) => p.id !== action.playerId),
        scores,
      }
    }

    case 'startGame': {
      if (state.status !== 'setup' || state.players.length === 0) return state
      return { ...state, status: 'playing', activePlayerIndex: 0 }
    }

    case 'recordScore': {
      if (state.status !== 'playing') return state
      const activePlayer = state.players[state.activePlayerIndex]
      if (!activePlayer || activePlayer.id !== action.playerId) return state

      const card = state.scores[action.playerId] ?? {}
      if (action.category in card) return state // already scored

      const points = scoringFunctions[action.category](action.dice)
      const scores = {
        ...state.scores,
        [action.playerId]: { ...card, [action.category]: points },
      }
      const nextState: GameState = { ...state, scores }

      if (isGameComplete(nextState)) {
        return { ...nextState, status: 'finished' }
      }
      return {
        ...nextState,
        activePlayerIndex: (state.activePlayerIndex + 1) % state.players.length,
      }
    }

    case 'reset':
      return initialGameState

    default:
      return state
  }
}
