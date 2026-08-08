import { beforeEach, describe, expect, it } from 'vitest'
import type { GameState } from '../../domain/game'
import {
  clearGame,
  loadGame,
  loadRecentNames,
  rememberNames,
  saveGame,
} from './gameStorage'

const STORAGE_KEY = 'kniffel-scoreboard:game:v2'

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
})
