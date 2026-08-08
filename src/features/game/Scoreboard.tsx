import { FinalStandings } from './FinalStandings'
import { GameScreen } from './GameScreen'
import { GameSetup } from './GameSetup'
import { useKniffelGame } from './useKniffelGame'

export function Scoreboard() {
  const { state, dispatch } = useKniffelGame()

  switch (state.status) {
    case 'setup':
      return <GameSetup state={state} dispatch={dispatch} />
    case 'finished':
      return <FinalStandings state={state} dispatch={dispatch} />
    default:
      return <GameScreen state={state} dispatch={dispatch} />
  }
}
