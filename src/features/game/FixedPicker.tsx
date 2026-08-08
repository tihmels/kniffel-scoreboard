import type { ScoreCategory } from '../../domain/scoring'
import { CATEGORY_LABELS } from './labels'
import styles from './FixedPicker.module.css'
import { ScratchMark } from './ScratchMark'

interface FixedPickerProps {
  category: ScoreCategory
  /** The points when scored, or a label opening the sum sheet instead. */
  value: number | undefined
  current: number | undefined
  onPick: (value: number) => void
  onOpenSheet?: () => void
}

/**
 * Got it, or didn't: the four fixed-value categories are binary, so they need
 * two targets and no numbers. Free-sum categories reuse the same row, with the
 * value button opening the sheet instead of scoring outright.
 */
export function FixedPicker({
  category,
  value,
  current,
  onPick,
  onOpenSheet,
}: FixedPickerProps) {
  const label = CATEGORY_LABELS[category]
  const scratched = current === 0

  return (
    <div className={styles.row}>
      <button
        type="button"
        className={`${styles.scratch} ${scratched ? styles.scratched : ''}`}
        aria-label={`${label} streichen`}
        aria-pressed={scratched}
        onClick={() => onPick(0)}
      >
        <ScratchMark />
      </button>
      {value === undefined ? (
        <button
          type="button"
          className={styles.sheet}
          onClick={onOpenSheet}
          aria-label={`${label} — Augensumme wählen`}
        >
          Summe ▸
        </button>
      ) : (
        <button
          type="button"
          className={`${styles.value} ${current === value ? styles.selected : ''}`}
          aria-pressed={current === value}
          aria-label={`${label}, ${value} Punkte`}
          onClick={() => onPick(value)}
        >
          {value}
        </button>
      )}
    </div>
  )
}
