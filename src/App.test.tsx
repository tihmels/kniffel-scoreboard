import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders player setup in local mode without a backend', () => {
    render(<App />)
    expect(screen.getByText('Neues Spiel')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Spiel starten' }),
    ).toBeInTheDocument()
  })
})
