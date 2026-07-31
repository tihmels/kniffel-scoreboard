import type { DiceRoll, ScoreCategory } from '../scoring'

export type PlayerId = string

export interface Player {
  id: PlayerId
  name: string
}

/**
 * A player's scorecard. A category present in the map has been filled with its
 * (possibly zero) score; an absent category is still open.
 */
export type ScoreCard = Partial<Record<ScoreCategory, number>>

export type GameStatus = 'setup' | 'playing' | 'finished'

export interface GameState {
  status: GameStatus
  players: Player[]
  /** Scorecard per player id. */
  scores: Record<PlayerId, ScoreCard>
  /** Index into `players` whose turn it is (meaningful while `playing`). */
  activePlayerIndex: number
}

export type GameAction =
  | { type: 'addPlayer'; name: string }
  | { type: 'removePlayer'; playerId: PlayerId }
  | { type: 'startGame' }
  | {
      type: 'recordScore'
      playerId: PlayerId
      category: ScoreCategory
      dice: DiceRoll
    }
  | { type: 'reset' }
