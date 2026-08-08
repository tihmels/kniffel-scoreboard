import { beforeEach, describe, expect, it } from 'vitest'
import type { GameRecord, GameState } from '../../domain/game'
import {
  clearGame,
  loadGame,
  loadHistory,
  loadRecentNames,
  rememberFinishedGame,
  rememberNames,
  saveGame,
} from './gameStorage'

const STORAGE_KEY = 'kniffel-scoreboard:game:v2'
const HISTORY_KEY = 'kniffel-scoreboard:history:v1'

function record(id: string): GameRecord {
  return {
    id,
    finishedAt: '2026-08-08T18:00:00.000Z',
    players: [{ id: 'p1', name: 'Ann' }],
    scores: { p1: { ones: 3 } },
  }
}

const sampleState: GameState = {
  status: 'playing',
  players: [{ id: 'p1', name: 'Ann' }],
  scores: { p1: { ones: 3 } },
  activePlayerIndex: 0,
  lastEntry: null,
}

describe('gameStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('round-trips a saved game', () => {
    saveGame(sampleState)
    expect(loadGame()).toEqual(sampleState)
  })

  it('returns null when nothing is saved', () => {
    expect(loadGame()).toBeNull()
  })

  it('clears a saved game', () => {
    saveGame(sampleState)
    clearGame()
    expect(loadGame()).toBeNull()
  })

  it('ignores corrupt JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{ not json')
    expect(loadGame()).toBeNull()
  })

  it('ignores data that is not a game state', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }))
    expect(loadGame()).toBeNull()
  })

  it('remembers player names most-recent first, without duplicates', () => {
    rememberNames(['Ann', 'Bo'])
    rememberNames(['Cid', 'Ann'])
    expect(loadRecentNames()).toEqual(['Cid', 'Ann', 'Bo'])
  })

  it('caps the remembered names and drops blanks', () => {
    rememberNames(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', '  '])
    const names = loadRecentNames()
    expect(names).toHaveLength(8)
    expect(names).not.toContain('')
  })

  it('starts with an empty history', () => {
    expect(loadHistory()).toEqual([])
  })

  it('keeps finished games newest first', () => {
    rememberFinishedGame(record('first'))
    rememberFinishedGame(record('second'))

    expect(loadHistory().map((entry) => entry.id)).toEqual(['second', 'first'])
  })

  it('caps the history', () => {
    for (let index = 0; index < 30; index += 1) {
      rememberFinishedGame(record(`g${index}`))
    }

    const history = loadHistory()
    expect(history).toHaveLength(25)
    expect(history[0]?.id).toBe('g29')
  })

  it('drops history entries that are not game records', () => {
    window.localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([record('good'), { foo: 'bar' }]),
    )

    expect(loadHistory().map((entry) => entry.id)).toEqual(['good'])
  })

  it('ignores a corrupt history', () => {
    window.localStorage.setItem(HISTORY_KEY, '{ not json')
    expect(loadHistory()).toEqual([])
  })
})
