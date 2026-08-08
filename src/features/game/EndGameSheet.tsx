import { useEffect } from 'react'
import styles from './EndGameSheet.module.css'

interface EndGameSheetProps {
  onConfirm: () => void
  onClose: () => void
}

/**
 * Leaving a game part-way throws the scorepad away — only games played to the
 * last category are archived — so it says so and asks first.
 */
export function EndGameSheet({ onConfirm, onClose }: EndGameSheetProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className={styles.overlay}>
      <button
        type="button"
        className={styles.scrim}
        aria-label="Schließen"
        onClick={onClose}
      />
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label="Spiel beenden"
      >
        <div className={styles.handle} aria-hidden="true" />
        <h2 className={styles.title}>Spiel beenden?</h2>
        <p className={styles.text}>
          Der laufende Spielstand wird verworfen. Nur zu Ende gespielte Partien
          landen unter „Letzte Spiele“.
        </p>

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            Weiterspielen
          </button>
          <button type="button" className={styles.confirm} onClick={onConfirm}>
            Beenden und verwerfen
          </button>
        </div>
      </div>
    </div>
  )
}
