import type { GameState, GameStatus } from '../../domain/game'

/**
 * Persists the local game to `localStorage`. This is the browser-only
 * persistence milestone; cloud sync arrives later via `services/amplify`.
 *
 * The key is versioned so an incompatible future shape is ignored rather than
 * crashing an old save into new code.
 */
const STORAGE_KEY = 'kniffel-scoreboard:game:v1'

const VALID_STATUSES: readonly GameStatus[] = ['setup', 'playing', 'finished']

function getStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    // Accessing localStorage can throw (e.g. blocked cookies / private mode).
    return null
  }
}

/** Narrow unknown parsed JSON to a plausible GameState. */
function isGameState(value: unknown): value is GameState {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    VALID_STATUSES.includes(candidate.status as GameStatus) &&
    Array.isArray(candidate.players) &&
    typeof candidate.scores === 'object' &&
    candidate.scores !== null &&
    typeof candidate.activePlayerIndex === 'number'
  )
}

/** Load a previously saved game, or `null` when there is none / it is unusable. */
export function loadGame(): GameState | null {
  const storage = getStorage()
  if (!storage) return null

  const raw = storage.getItem(STORAGE_KEY)
  if (raw === null) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    return isGameState(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** Persist the current game. Failures (e.g. quota) are swallowed by design. */
export function saveGame(state: GameState): void {
  const storage = getStorage()
  if (!storage) return

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Persistence is best-effort; never let it break gameplay.
  }
}

/** Remove any saved game. */
export function clearGame(): void {
  const storage = getStorage()
  if (!storage) return

  try {
    storage.removeItem(STORAGE_KEY)
  } catch {
    // no-op
  }
}
