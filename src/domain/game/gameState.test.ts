import { describe, expect, it } from 'vitest'
import type { DiceRoll } from '../scoring'
import {
  gameReducer,
  grandTotal,
  initialGameState,
  isGameComplete,
  upperBonus,
  winners,
} from './gameState'
import type { GameState } from './types'

function withPlayers(...names: string[]): GameState {
  return names.reduce(
    (state, name) => gameReducer(state, { type: 'addPlayer', name }),
    initialGameState,
  )
}

describe('setup', () => {
  it('adds players and ignores blank names', () => {
    const state = gameReducer(withPlayers('Ann'), {
      type: 'addPlayer',
      name: '  ',
    })
    expect(state.players).toHaveLength(1)
    expect(state.players[0]?.name).toBe('Ann')
    expect(state.scores[state.players[0]!.id]).toEqual({})
  })

  it('removes a player and their scorecard', () => {
    const setup = withPlayers('Ann', 'Bo')
    const id = setup.players[0]!.id
    const state = gameReducer(setup, { type: 'removePlayer', playerId: id })
    expect(state.players).toHaveLength(1)
    expect(state.scores[id]).toBeUndefined()
  })

  it('will not start without players', () => {
    expect(gameReducer(initialGameState, { type: 'startGame' }).status).toBe(
      'setup',
    )
  })
})

describe('turn taking', () => {
  it('records a score and advances to the next player', () => {
    const started = gameReducer(withPlayers('Ann', 'Bo'), { type: 'startGame' })
    const annId = started.players[0]!.id
    const dice: DiceRoll = [3, 3, 3, 5, 1]
    const next = gameReducer(started, {
      type: 'recordScore',
      playerId: annId,
      category: 'threes',
      dice,
    })
    expect(next.scores[annId]?.threes).toBe(9)
    expect(next.activePlayerIndex).toBe(1)
  })

  it('ignores a record from a non-active player', () => {
    const started = gameReducer(withPlayers('Ann', 'Bo'), { type: 'startGame' })
    const boId = started.players[1]!.id
    const next = gameReducer(started, {
      type: 'recordScore',
      playerId: boId,
      category: 'ones',
      dice: [1, 1, 1, 1, 1],
    })
    expect(next).toBe(started)
  })

  it('ignores a second score in an already-filled category', () => {
    const started = gameReducer(withPlayers('Ann'), { type: 'startGame' })
    const annId = started.players[0]!.id
    const first = gameReducer(started, {
      type: 'recordScore',
      playerId: annId,
      category: 'chance',
      dice: [1, 2, 3, 4, 5],
    })
    const second = gameReducer(first, {
      type: 'recordScore',
      playerId: annId,
      category: 'chance',
      dice: [6, 6, 6, 6, 6],
    })
    expect(second.scores[annId]?.chance).toBe(15)
  })
})

describe('totals', () => {
  it('awards the +35 upper bonus at 63 and sums the grand total', () => {
    const card = {
      ones: 3,
      twos: 6,
      threes: 9,
      fours: 12,
      fives: 15,
      sixes: 18,
      kniffel: 50,
    }
    expect(upperBonus(card)).toBe(35)
    expect(grandTotal(card)).toBe(63 + 35 + 50)
  })
})

describe('finishing', () => {
  it('marks the game finished and picks the winner when all cards are full', () => {
    const CATEGORIES = [
      'ones',
      'twos',
      'threes',
      'fours',
      'fives',
      'sixes',
      'threeOfAKind',
      'fourOfAKind',
      'fullHouse',
      'smallStraight',
      'largeStraight',
      'kniffel',
      'chance',
    ] as const

    let state = gameReducer(withPlayers('Ann'), { type: 'startGame' })
    const annId = state.players[0]!.id
    for (const category of CATEGORIES) {
      state = gameReducer(state, {
        type: 'recordScore',
        playerId: annId,
        category,
        dice: [6, 6, 6, 6, 6],
      })
    }
    expect(isGameComplete(state)).toBe(true)
    expect(state.status).toBe('finished')
    expect(winners(state).map((p) => p.name)).toEqual(['Ann'])
  })
})
