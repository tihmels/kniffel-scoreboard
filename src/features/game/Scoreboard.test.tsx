import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Scoreboard } from './Scoreboard'

async function startGameWith(names: string[]) {
  const user = userEvent.setup()
  const view = render(<Scoreboard />)

  for (let index = 0; index < names.length; index += 1) {
    await user.click(
      screen.getByRole('button', { name: `+ Spieler ${index + 1}` }),
    )
    await user.click(
      screen.getByRole('button', { name: `Spieler ${index + 1}` }),
    )
    const field = screen.getByLabelText(`Spieler ${index + 1} umbenennen`)
    await user.clear(field)
    await user.type(field, `${names[index]}{Enter}`)
  }

  await user.click(screen.getByRole('button', { name: 'Spiel starten' }))
  return { user, unmount: view.unmount }
}

/** Every category, in screen order. Scratching each one plays a game out. */
const CATEGORIES = [
  'Einser',
  'Zweier',
  'Dreier',
  'Vierer',
  'Fünfer',
  'Sechser',
  'Dreierpasch',
  'Viererpasch',
  'Full House',
  'Kleine Straße',
  'Große Straße',
  'Kniffel',
  'Chance',
]

async function scratchEveryCategory(user: ReturnType<typeof userEvent.setup>) {
  for (const label of CATEGORIES) {
    await user.click(screen.getByRole('button', { name: `${label} streichen` }))
  }
}

describe('Scoreboard', () => {
  it('scores an upper category in a single tap', async () => {
    const { user } = await startGameWith(['Ann'])
    expect(screen.getByText('Ann ist dran')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: '3 × Dreier, 9 Punkte' }),
    )

    // The row collapses to its recorded value once filled.
    expect(
      screen.getByRole('button', { name: 'Dreier, 9 Punkte — ändern' }),
    ).toBeInTheDocument()
  })

  it('scratches a category so it reads as spent, not open', async () => {
    const { user } = await startGameWith(['Ann'])

    await user.click(screen.getByRole('button', { name: 'Kniffel streichen' }))

    expect(
      screen.getByRole('button', { name: 'Kniffel, gestrichen — ändern' }),
    ).toBeInTheDocument()
  })

  it('takes two taps for a free-sum category', async () => {
    const { user } = await startGameWith(['Ann'])

    await user.click(
      screen.getByRole('button', { name: 'Chance — Augensumme wählen' }),
    )
    await user.click(within(screen.getByRole('dialog')).getByText('22'))

    expect(
      screen.getByRole('button', { name: 'Chance, 22 Punkte — ändern' }),
    ).toBeInTheDocument()
  })

  it('corrects a filled category by tapping it again', async () => {
    const { user } = await startGameWith(['Ann'])

    await user.click(
      screen.getByRole('button', { name: '3 × Dreier, 9 Punkte' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Dreier, 9 Punkte — ändern' }),
    )
    await user.click(
      screen.getByRole('button', { name: '5 × Dreier, 15 Punkte' }),
    )

    expect(
      screen.getByRole('button', { name: 'Dreier, 15 Punkte — ändern' }),
    ).toBeInTheDocument()
  })

  it('undoes the last entry', async () => {
    const { user } = await startGameWith(['Ann'])

    await user.click(
      screen.getByRole('button', { name: '3 × Dreier, 9 Punkte' }),
    )
    await user.click(screen.getAllByRole('button', { name: /rückgängig/i })[0]!)

    expect(
      screen.getByRole('button', { name: '3 × Dreier, 9 Punkte' }),
    ).toBeInTheDocument()
  })

  it('moves the turn hint on but still accepts any player', async () => {
    const { user } = await startGameWith(['Ann', 'Bo'])

    await user.click(
      screen.getByRole('button', { name: '3 × Dreier, 9 Punkte' }),
    )
    expect(screen.getByText('Bo ist dran')).toBeInTheDocument()

    // Stepping back to Ann is a hint change, not a rule violation.
    await user.click(screen.getByRole('button', { name: 'Vorheriger Spieler' }))
    expect(screen.getByText('Ann ist dran')).toBeInTheDocument()
  })

  it('ends a running game and discards it', async () => {
    const { user } = await startGameWith(['Ann'])
    await user.click(
      screen.getByRole('button', { name: '3 × Dreier, 9 Punkte' }),
    )

    await user.click(screen.getByRole('button', { name: 'Beenden' }))
    await user.click(
      screen.getByRole('button', { name: 'Beenden und verwerfen' }),
    )

    expect(
      screen.getByRole('button', { name: 'Spiel starten' }),
    ).toBeInTheDocument()
    // Discarded, so it never reaches the history — there is nothing to open.
    expect(
      screen.queryByRole('button', { name: 'Letzte Spiele' }),
    ).not.toBeInTheDocument()
  })

  it('keeps the game when ending it is cancelled', async () => {
    const { user } = await startGameWith(['Ann'])

    await user.click(screen.getByRole('button', { name: 'Beenden' }))
    await user.click(screen.getByRole('button', { name: 'Weiterspielen' }))

    expect(screen.getByText('Ann ist dran')).toBeInTheDocument()
  })

  it('archives a game played to the last category', async () => {
    const { user } = await startGameWith(['Ann'])
    await scratchEveryCategory(user)

    await user.click(screen.getByRole('button', { name: 'Neues Spiel' }))
    await user.click(screen.getByRole('button', { name: 'Letzte Spiele' }))

    expect(screen.getByText('Ann gewinnt')).toBeInTheDocument()
  })

  it('reopens an archived card as a read-only sheet', async () => {
    const { user } = await startGameWith(['Ann'])
    await scratchEveryCategory(user)
    await user.click(screen.getByRole('button', { name: 'Neues Spiel' }))
    await user.click(screen.getByRole('button', { name: 'Letzte Spiele' }))

    await user.click(screen.getByRole('button', { name: /Ann gewinnt/ }))

    expect(screen.getByRole('columnheader', { name: 'AN' })).toBeInTheDocument()
    expect(
      screen.getByRole('rowheader', { name: 'Gesamt' }),
    ).toBeInTheDocument()
  })

  it('restores a game in progress after a remount', async () => {
    const { user, unmount } = await startGameWith(['Bo'])
    await user.click(
      screen.getByRole('button', { name: '2 × Zweier, 4 Punkte' }),
    )

    unmount()
    render(<Scoreboard />)

    expect(screen.getByText('Bo ist dran')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Zweier, 4 Punkte — ändern' }),
    ).toBeInTheDocument()
  })
})
