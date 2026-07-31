import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the application shell and player setup', () => {
    render(<App />)
    expect(screen.getByText('Kniffel Scoreboard')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /players/i }),
    ).toBeInTheDocument()
  })
})
