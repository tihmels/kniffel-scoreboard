import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the application shell', () => {
    render(<App />)
    expect(screen.getByText('Kniffel Scoreboard')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /scorecard preview/i }),
    ).toBeInTheDocument()
  })
})
