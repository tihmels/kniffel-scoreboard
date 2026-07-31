import { beforeEach, describe, expect, it } from 'vitest'
import type { GameState } from '../../domain/game'
import { clearGame, loadGame, saveGame } from './gameStorage'

const STORAGE_KEY = 'kniffel-scoreboard:game:v1'

const sampleState: GameState = {
  status: 'playing',
  players: [{ id: 'p1', name: 'Ann' }],
  scores: { p1: { ones: 3 } },
  activePlayerIndex: 0,
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
})
