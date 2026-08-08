import { useEffect } from 'react'
import type { ScoreEntry } from '../../domain/game'
import { CATEGORY_LABELS } from './labels'
import styles from './UndoToast.module.css'

/** Long enough to notice a mistap and act on it, short enough not to nag. */
const VISIBLE_MS = 6000

interface UndoToastProps {
  entry: ScoreEntry
  playerName: string
  onUndo: () => void
  onDismiss: () => void
}

/** Names what was just recorded — a second chance beside the tappable row. */
export function UndoToast({
  entry,
  playerName,
  onUndo,
  onDismiss,
}: UndoToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [entry, onDismiss])

  return (
    <div className={styles.toast} role="status">
      <span className={styles.text}>
        {playerName} · {CATEGORY_LABELS[entry.category]}{' '}
        <strong className={styles.value}>
          {entry.value === 0 ? 'gestrichen' : entry.value}
        </strong>
        {entry.value === 0 ? '' : ' eingetragen'}
      </span>
      <button type="button" className={styles.undo} onClick={onUndo}>
        Rückgängig
      </button>
    </div>
  )
}
