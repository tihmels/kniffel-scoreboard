import { useEffect } from 'react'
import { FREE_SUM_MAX, FREE_SUM_MIN } from '../../domain/scoring'
import type { ScoreCategory } from '../../domain/scoring'
import { CATEGORY_LABELS } from './labels'
import { ScratchMark } from './ScratchMark'
import styles from './SumSheet.module.css'

const SUMS = Array.from(
  { length: FREE_SUM_MAX - FREE_SUM_MIN + 1 },
  (_, offset) => FREE_SUM_MIN + offset,
)

interface SumSheetProps {
  category: ScoreCategory
  playerName: string
  current: number | undefined
  onPick: (value: number) => void
  onClose: () => void
}

/**
 * The only two-tap entry in the app. Five dice can only sum to 5–30, so the
 * whole value space fits on screen — no keypad, and no typos to correct.
 */
export function SumSheet({
  category,
  playerName,
  current,
  onPick,
  onClose,
}: SumSheetProps) {
  const label = CATEGORY_LABELS[category]

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
        aria-label={`${label} — Augensumme`}
      >
        <div className={styles.handle} aria-hidden="true" />
        <div className={styles.head}>
          <span className={styles.title}>{label}</span>
          <span className={styles.who}>{playerName} · Augensumme</span>
        </div>

        <button
          type="button"
          className={styles.scratch}
          aria-pressed={current === 0}
          onClick={() => onPick(0)}
        >
          <ScratchMark />
          Streichen · 0 Punkte
        </button>

        <div className={styles.grid}>
          {SUMS.map((sum) => (
            <button
              key={sum}
              type="button"
              className={`${styles.cell} ${current === sum ? styles.selected : ''}`}
              aria-pressed={current === sum}
              onClick={() => onPick(sum)}
            >
              {sum}
            </button>
          ))}
        </div>

        <p className={styles.hint}>
          Tippen trägt sofort ein und schließt — kein Bestätigen.
        </p>
      </div>
    </div>
  )
}
