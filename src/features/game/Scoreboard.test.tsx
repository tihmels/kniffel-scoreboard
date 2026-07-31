import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Scoreboard } from './Scoreboard'

describe('Scoreboard', () => {
  it('runs a turn from setup through scoring a category', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)

    await user.type(screen.getByLabelText('Player name'), 'Ann')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.click(screen.getByRole('button', { name: /start game/i }))

    expect(screen.getByText('Now playing:')).toBeInTheDocument()

    // Enter three 3s and score the "Threes" category (3 + 3 + 3 = 9).
    const [d1, d2, d3] = [
      screen.getByLabelText('Die 1'),
      screen.getByLabelText('Die 2'),
      screen.getByLabelText('Die 3'),
    ]
    await user.selectOptions(d1, '3')
    await user.selectOptions(d2, '3')
    await user.selectOptions(d3, '3')

    await user.click(
      screen.getByRole('button', { name: /score threes as 9 for ann/i }),
    )

    const threesRow = screen.getByText('Threes').closest('tr')!
    expect(within(threesRow).getByText('9')).toBeInTheDocument()
  })
})
