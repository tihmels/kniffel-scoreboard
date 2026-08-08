import { describe, expect, it } from 'vitest'
import { SCORE_CATEGORIES } from '../scoring'
import {
  bonusState,
  countSecuringBonus,
  currentRound,
  gameReducer,
  grandTotal,
  initialGameState,
  isGameComplete,
  maxAchievableUpper,
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

function started(...names: string[]): GameState {
  return gameReducer(withPlayers(...names), { type: 'startGame' })
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

  it('renames and reorders players', () => {
    const setup = withPlayers('Ann', 'Bo')
    const boId = setup.players[1]!.id
    const renamed = gameReducer(setup, {
      type: 'renamePlayer',
      playerId: boId,
      name: 'Bodo',
    })
    expect(renamed.players[1]?.name).toBe('Bodo')

    const moved = gameReducer(renamed, {
      type: 'movePlayer',
      playerId: boId,
      offset: -1,
    })
    expect(moved.players.map((p) => p.name)).toEqual(['Bodo', 'Ann'])
  })

  it('will not move a player past the ends of the list', () => {
    const setup = withPlayers('Ann', 'Bo')
    const annId = setup.players[0]!.id
    expect(
      gameReducer(setup, { type: 'movePlayer', playerId: annId, offset: -1 }),
    ).toBe(setup)
  })

  it('will not start without players', () => {
    expect(gameReducer(initialGameState, { type: 'startGame' }).status).toBe(
      'setup',
    )
  })
})

describe('recording scores', () => {
  it('records a value and advances the turn hint', () => {
    const state = started('Ann', 'Bo')
    const annId = state.players[0]!.id
    const next = gameReducer(state, {
      type: 'recordScore',
      playerId: annId,
      category: 'threes',
      value: 9,
    })
    expect(next.scores[annId]?.threes).toBe(9)
    expect(next.activePlayerIndex).toBe(1)
  })

  it('accepts a score for a player whose turn it is not', () => {
    // Turn order is a hint: a forgotten turn must never lock the pad.
    const state = started('Ann', 'Bo')
    const boId = state.players[1]!.id
    const next = gameReducer(state, {
      type: 'recordScore',
      playerId: boId,
      category: 'ones',
      value: 5,
    })
    expect(next.scores[boId]?.ones).toBe(5)
    expect(next.activePlayerIndex).toBe(0)
  })

  it('overwrites an already-filled category so mistakes can be corrected', () => {
    const state = started('Ann')
    const annId = state.players[0]!.id
    const first = gameReducer(state, {
      type: 'recordScore',
      playerId: annId,
      category: 'chance',
      value: 15,
    })
    const corrected = gameReducer(first, {
      type: 'recordScore',
      playerId: annId,
      category: 'chance',
      value: 22,
    })
    expect(corrected.scores[annId]?.chance).toBe(22)
  })

  it('rejects values a category can never hold', () => {
    const state = started('Ann')
    const annId = state.players[0]!.id
    for (const value of [7, 31, 2.5]) {
      const next = gameReducer(state, {
        type: 'recordScore',
        playerId: annId,
        category: 'threes',
        value,
      })
      expect(next).toBe(state)
    }
  })

  it('distinguishes a scratched zero from an open category', () => {
    const state = started('Ann')
    const annId = state.players[0]!.id
    const scratched = gameReducer(state, {
      type: 'recordScore',
      playerId: annId,
      category: 'kniffel',
      value: 0,
    })
    expect(scratched.scores[annId]?.kniffel).toBe(0)
    expect('kniffel' in scratched.scores[annId]!).toBe(true)
    expect('chance' in scratched.scores[annId]!).toBe(false)
  })

  it('clears a cell back to open', () => {
    const state = started('Ann')
    const annId = state.players[0]!.id
    const filled = gameReducer(state, {
      type: 'recordScore',
      playerId: annId,
      category: 'sixes',
      value: 24,
    })
    const cleared = gameReducer(filled, {
      type: 'clearScore',
      playerId: annId,
      category: 'sixes',
    })
    expect('sixes' in cleared.scores[annId]!).toBe(false)
  })
})

describe('undo', () => {
  it('restores an emptied cell and returns the turn hint', () => {
    const state = started('Ann', 'Bo')
    const annId = state.players[0]!.id
    const filled = gameReducer(state, {
      type: 'recordScore',
      playerId: annId,
      category: 'fours',
      value: 12,
    })
    const undone = gameReducer(filled, { type: 'undo' })
    expect('fours' in undone.scores[annId]!).toBe(false)
    expect(undone.activePlayerIndex).toBe(0)
    expect(undone.lastEntry).toBeNull()
  })

  it('restores the previous value when undoing a correction', () => {
    const state = started('Ann')
    const annId = state.players[0]!.id
    let next = gameReducer(state, {
      type: 'recordScore',
      playerId: annId,
      category: 'chance',
      value: 15,
    })
    next = gameReducer(next, {
      type: 'recordScore',
      playerId: annId,
      category: 'chance',
      value: 22,
    })
    expect(gameReducer(next, { type: 'undo' }).scores[annId]?.chance).toBe(15)
  })

  it('does nothing when there is no entry to undo', () => {
    const state = started('Ann')
    expect(gameReducer(state, { type: 'undo' })).toBe(state)
  })
})

describe('the upper bonus', () => {
  it('awards +35 at 63 and sums the grand total', () => {
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

  it('counts five of every unfilled face as still achievable', () => {
    expect(maxAchievableUpper({})).toBe(105)
    expect(maxAchievableUpper({ sixes: 0 })).toBe(75)
  })

  it('reports where a player stands', () => {
    expect(bonusState({})).toBe('undetermined')
    expect(bonusState({ ones: 3 })).toBe('reachable')
    expect(
      bonusState({ ones: 5, twos: 10, threes: 15, fours: 20, fives: 25 }),
    ).toBe('secured')
    // Scratching three faces puts 63 out of reach for good.
    expect(bonusState({ sixes: 0, fives: 0, fours: 0 })).toBe('missed')
  })

  it('names the count that would secure the bonus', () => {
    // 3 + 6 + 0 + 20 + 24 = 53, so 10 short with only the fours still open.
    const card = { ones: 3, twos: 6, threes: 0, fives: 20, sixes: 24 }
    expect(countSecuringBonus(card, 'fours')).toBe(3)
  })

  it('stays quiet when a category cannot close the gap alone', () => {
    // Five ones is 5 points against a 63-point gap.
    expect(countSecuringBonus({}, 'ones')).toBe(undefined)
  })

  it('stays quiet once the bonus is settled either way', () => {
    const secured = { ones: 5, twos: 10, threes: 15, fours: 20, fives: 25 }
    expect(countSecuringBonus(secured, 'sixes')).toBe(undefined)
    expect(countSecuringBonus({ sixes: 0, fives: 0, fours: 0 }, 'ones')).toBe(
      undefined,
    )
  })
})

describe('rounds and finishing', () => {
  it('derives the round from how many cells are filled', () => {
    let state = started('Ann', 'Bo')
    expect(currentRound(state)).toBe(1)
    state = gameReducer(state, {
      type: 'recordScore',
      playerId: state.players[0]!.id,
      category: 'ones',
      value: 3,
    })
    expect(currentRound(state)).toBe(1)
    state = gameReducer(state, {
      type: 'recordScore',
      playerId: state.players[1]!.id,
      category: 'ones',
      value: 2,
    })
    expect(currentRound(state)).toBe(2)
  })

  it('finishes when every card is full and picks the winner', () => {
    let state = started('Ann')
    const annId = state.players[0]!.id
    for (const category of SCORE_CATEGORIES) {
      state = gameReducer(state, {
        type: 'recordScore',
        playerId: annId,
        category,
        value: 0,
      })
    }
    expect(isGameComplete(state)).toBe(true)
    expect(state.status).toBe('finished')
    expect(winners(state).map((p) => p.name)).toEqual(['Ann'])
  })

  it('reopens a finished game when a cell is cleared', () => {
    let state = started('Ann')
    const annId = state.players[0]!.id
    for (const category of SCORE_CATEGORIES) {
      state = gameReducer(state, {
        type: 'recordScore',
        playerId: annId,
        category,
        value: 0,
      })
    }
    const reopened = gameReducer(state, {
      type: 'clearScore',
      playerId: annId,
      category: 'chance',
    })
    expect(reopened.status).toBe('playing')
  })

  it('keeps players but empties the cards on a rematch', () => {
    let state = started('Ann', 'Bo')
    state = gameReducer(state, {
      type: 'recordScore',
      playerId: state.players[0]!.id,
      category: 'ones',
      value: 3,
    })
    const rematch = gameReducer(state, { type: 'rematch' })
    expect(rematch.players).toHaveLength(2)
    expect(rematch.scores[rematch.players[0]!.id]).toEqual({})
    expect(rematch.status).toBe('playing')
  })
})
