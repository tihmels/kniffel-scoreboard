import {
  LOWER_CATEGORIES,
  MAX_DICE_PER_CATEGORY,
  SCORE_CATEGORIES,
  UPPER_BONUS,
  UPPER_BONUS_THRESHOLD,
  UPPER_CATEGORIES,
  UPPER_FACE,
  isValidScore,
  upperScore,
} from '../scoring'
import type { ScoreCategory, UpperCategory } from '../scoring'
import type {
  BonusState,
  GameAction,
  GameState,
  Player,
  PlayerId,
  ScoreCard,
} from './types'

export const initialGameState: GameState = {
  status: 'setup',
  players: [],
  scores: {},
  activePlayerIndex: 0,
  lastEntry: null,
}

/** Categories every player fills exactly once, so also the number of rounds. */
export const TOTAL_ROUNDS = SCORE_CATEGORIES.length

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

/**
 * The best upper subtotal still reachable: what is banked, plus five of every
 * face not yet filled. Once this drops below 63 the bonus is gone for good.
 */
export function maxAchievableUpper(card: ScoreCard): number {
  return UPPER_CATEGORIES.reduce((total, category) => {
    const recorded = card[category]
    return total + (recorded ?? upperScore(category, MAX_DICE_PER_CATEGORY))
  }, 0)
}

/** Points still needed for the bonus (0 once it is secured). */
export function bonusRemaining(card: ScoreCard): number {
  return Math.max(0, UPPER_BONUS_THRESHOLD - upperSubtotal(card))
}

/**
 * Where a player stands on the bonus. `undetermined` while the upper section is
 * untouched — there is nothing useful to say yet, so the UI stays quiet.
 */
export function bonusState(card: ScoreCard): BonusState {
  if (upperSubtotal(card) >= UPPER_BONUS_THRESHOLD) return 'secured'
  if (maxAchievableUpper(card) < UPPER_BONUS_THRESHOLD) return 'missed'
  const touched = UPPER_CATEGORIES.some((category) => category in card)
  return touched ? 'reachable' : 'undetermined'
}

/**
 * The smallest number of dice in `category` that would secure the bonus, or
 * `undefined` when this category cannot settle it on its own. Drives the row
 * hint that makes the bonus decision visible at the moment it is taken.
 */
export function countSecuringBonus(
  card: ScoreCard,
  category: UpperCategory,
): number | undefined {
  if (category in card) return undefined
  if (bonusState(card) === 'secured' || bonusState(card) === 'missed') {
    return undefined
  }
  const needed = bonusRemaining(card)
  const count = Math.ceil(needed / UPPER_FACE[category])
  return count <= MAX_DICE_PER_CATEGORY ? count : undefined
}

/** How many categories a card has filled. */
export function filledCount(card: ScoreCard): number {
  return SCORE_CATEGORIES.filter((category) => category in card).length
}

/** Every category has been filled. */
export function isCardComplete(card: ScoreCard): boolean {
  return filledCount(card) === TOTAL_ROUNDS
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

/**
 * The round in progress, derived from how many cells are filled — there is no
 * separate counter to keep in step.
 */
export function currentRound(state: GameState): number {
  if (state.players.length === 0) return 1
  const filled = state.players.reduce(
    (total, player) => total + filledCount(state.scores[player.id] ?? {}),
    0,
  )
  return Math.min(TOTAL_ROUNDS, Math.floor(filled / state.players.length) + 1)
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

/** Players ranked by grand total, highest first. Ties keep turn order. */
export function standings(state: GameState): Player[] {
  return [...state.players].sort(
    (a, b) =>
      grandTotal(state.scores[b.id] ?? {}) -
      grandTotal(state.scores[a.id] ?? {}),
  )
}

/** The single player leading outright, or `undefined` while tied. */
export function leader(state: GameState): Player | undefined {
  const best = winners(state)
  return best.length === 1 ? best[0] : undefined
}

function playerIndex(state: GameState, playerId: PlayerId): number {
  return state.players.findIndex((player) => player.id === playerId)
}

/** Recompute status after a card changes: filling the last cell ends the game. */
function withStatus(state: GameState): GameState {
  const status = isGameComplete(state) ? 'finished' : 'playing'
  return status === state.status ? state : { ...state, status }
}

function writeScore(
  state: GameState,
  playerId: PlayerId,
  category: ScoreCategory,
  value: number | undefined,
): GameState['scores'] {
  const card = { ...(state.scores[playerId] ?? {}) }
  if (value === undefined) {
    delete card[category]
  } else {
    card[category] = value
  }
  return { ...state.scores, [playerId]: card }
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

    case 'renamePlayer': {
      const name = action.name.trim()
      if (name === '') return state
      return {
        ...state,
        players: state.players.map((player) =>
          player.id === action.playerId ? { ...player, name } : player,
        ),
      }
    }

    case 'movePlayer': {
      if (state.status !== 'setup') return state
      const from = playerIndex(state, action.playerId)
      if (from === -1) return state
      const to = from + action.offset
      if (to < 0 || to >= state.players.length) return state
      const players = [...state.players]
      const [moved] = players.splice(from, 1)
      if (!moved) return state
      players.splice(to, 0, moved)
      return { ...state, players }
    }

    case 'startGame': {
      if (state.status !== 'setup' || state.players.length === 0) return state
      return { ...state, status: 'playing', activePlayerIndex: 0 }
    }

    case 'setActivePlayer': {
      if (state.players.length === 0) return state
      const index = Math.max(
        0,
        Math.min(state.players.length - 1, action.index),
      )
      return { ...state, activePlayerIndex: index }
    }

    case 'recordScore': {
      if (state.status === 'setup') return state
      const index = playerIndex(state, action.playerId)
      if (index === -1) return state
      if (!isValidScore(action.category, action.value)) return state

      // Recording for any player is allowed — turn order is only a hint — and
      // doing so moves the hint on from whoever was just filled in.
      const previous = state.scores[action.playerId]?.[action.category]
      return withStatus({
        ...state,
        scores: writeScore(
          state,
          action.playerId,
          action.category,
          action.value,
        ),
        activePlayerIndex: (index + 1) % state.players.length,
        lastEntry: {
          playerId: action.playerId,
          category: action.category,
          value: action.value,
          previous,
        },
      })
    }

    case 'clearScore': {
      if (state.status === 'setup') return state
      const index = playerIndex(state, action.playerId)
      if (index === -1) return state
      if (!(action.category in (state.scores[action.playerId] ?? {}))) {
        return state
      }
      return withStatus({
        ...state,
        scores: writeScore(state, action.playerId, action.category, undefined),
        activePlayerIndex: index,
        lastEntry: null,
      })
    }

    case 'undo': {
      const entry = state.lastEntry
      if (!entry) return state
      const index = playerIndex(state, entry.playerId)
      if (index === -1) return { ...state, lastEntry: null }
      return withStatus({
        ...state,
        scores: writeScore(
          state,
          entry.playerId,
          entry.category,
          entry.previous,
        ),
        activePlayerIndex: index,
        lastEntry: null,
      })
    }

    case 'rematch': {
      if (state.players.length === 0) return state
      const scores = Object.fromEntries(
        state.players.map((player) => [player.id, {}]),
      )
      return {
        ...state,
        status: 'playing',
        scores,
        activePlayerIndex: 0,
        lastEntry: null,
      }
    }

    case 'reset':
      return initialGameState

    default:
      return state
  }
}
