import type { GameState } from '../../domain/game'
import { AppBar } from './AppBar'
import { ScoreGrid } from './ScoreGrid'
import { ScratchMark } from './ScratchMark'
import styles from './OverviewScreen.module.css'

interface OverviewScreenProps {
  state: GameState
  onClose: () => void
}

/** The whole sheet, for when someone wants to study the standings. */
export function OverviewScreen({ state, onClose }: OverviewScreenProps) {
  return (
    <div className={styles.screen}>
      <AppBar
        title="Gesamtübersicht"
        actions={
          <button type="button" className={styles.done} onClick={onClose}>
            Fertig
          </button>
        }
      />
      <div className={styles.body}>
        <ScoreGrid state={state} />
        <div className={styles.legend}>
          <span className={styles.item}>
            <ScratchMark boxed /> gestrichen
          </span>
          <span className={styles.item}>
            <span className={styles.open}>·</span> offen
          </span>
        </div>
      </div>
    </div>
  )
}
