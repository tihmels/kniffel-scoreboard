import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the shell and player setup in local mode without a backend', () => {
    render(<App />)
    expect(screen.getByText('Kniffel Scoreboard')).toBeInTheDocument()
    expect(screen.getByText(/local mode/i)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /players/i }),
    ).toBeInTheDocument()
  })
})
