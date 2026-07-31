import { AuthGate } from './features/auth/AuthGate'
import { Scoreboard } from './features/game/Scoreboard'

function App() {
  return (
    <AuthGate>
      <Scoreboard />
    </AuthGate>
  )
}

export default App
