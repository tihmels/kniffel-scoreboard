import type { ScoreCategory } from '../scoring'

export type PlayerId = string

export interface Player {
  id: PlayerId
  name: string
}

/**
 * A player's scorecard. A category present in the map has been filled with its
 * (possibly zero) score; an absent category is still open. A recorded `0` means
 * the category was deliberately scratched — never the same thing as absent.
 */
export type ScoreCard = Partial<Record<ScoreCategory, number>>

export type GameStatus = 'setup' | 'playing' | 'finished'

/**
 * The most recent recording, kept so it can be undone and named in a toast.
 * `previous` is what the cell held before, so a correction can be rolled back
 * to its old value rather than merely cleared.
 */
export interface ScoreEntry {
  playerId: PlayerId
  category: ScoreCategory
  value: number
  previous: number | undefined
}

export interface GameState {
  status: GameStatus
  players: Player[]
  /** Scorecard per player id. */
  scores: Record<PlayerId, ScoreCard>
  /**
   * Index into `players` whose turn it probably is. A hint, not a rule: any
   * player's card can be filled at any time, which then moves the hint on.
   */
  activePlayerIndex: number
  lastEntry: ScoreEntry | null
}

/** How far a player is from the +35 upper-section bonus. */
export type BonusState = 'undetermined' | 'reachable' | 'secured' | 'missed'

export type GameAction =
  | { type: 'addPlayer'; name: string }
  | { type: 'removePlayer'; playerId: PlayerId }
  | { type: 'renamePlayer'; playerId: PlayerId; name: string }
  | { type: 'movePlayer'; playerId: PlayerId; offset: number }
  | { type: 'startGame' }
  | { type: 'setActivePlayer'; index: number }
  | {
      type: 'recordScore'
      playerId: PlayerId
      category: ScoreCategory
      value: number
    }
  | { type: 'clearScore'; playerId: PlayerId; category: ScoreCategory }
  | { type: 'undo' }
  | { type: 'rematch' }
  | { type: 'reset' }
