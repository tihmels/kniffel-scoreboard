import type { ReactNode } from 'react'
import styles from './AppBar.module.css'

interface AppBarProps {
  title: string
  /** Muted text after the title, e.g. the round counter's "von 13". */
  detail?: string
  onUndo?: () => void
  actions?: ReactNode
}

/** The single 44px bar: where the game is, plus the two escapes from a mistake. */
export function AppBar({ title, detail, onUndo, actions }: AppBarProps) {
  return (
    <div className={styles.bar}>
      <span className={styles.title}>{title}</span>
      {detail && <span className={styles.detail}>{detail}</span>}
      <span className={styles.spacer} />
      {onUndo && (
        <button type="button" className={styles.undo} onClick={onUndo}>
          ↺ Rückgängig
        </button>
      )}
      {actions}
    </div>
  )
}
