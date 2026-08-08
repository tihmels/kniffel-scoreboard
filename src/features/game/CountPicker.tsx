import { MAX_DICE_PER_CATEGORY, upperScore } from '../../domain/scoring'
import type { UpperCategory } from '../../domain/scoring'
import { CATEGORY_LABELS } from './labels'
import styles from './CountPicker.module.css'
import { ScratchMark } from './ScratchMark'

const COUNTS = Array.from(
  { length: MAX_DICE_PER_CATEGORY + 1 },
  (_, count) => count,
)

interface CountPickerProps {
  category: UpperCategory
  current: number | undefined
  onPick: (value: number) => void
}

/**
 * "How many sixes?" rather than "type 18". Six targets, one tap, and the
 * leftmost is the scratch — so writing off a category costs exactly as much as
 * scoring one.
 */
export function CountPicker({ category, current, onPick }: CountPickerProps) {
  const label = CATEGORY_LABELS[category]

  return (
    <div className={styles.grid} role="group" aria-label={label}>
      {COUNTS.map((count) => {
        const value = upperScore(category, count)
        const selected = current === value
        const scratch = count === 0

        return (
          <button
            key={count}
            type="button"
            className={`${styles.cell} ${scratch ? styles.scratch : ''} ${
              selected ? styles.selected : ''
            }`}
            aria-pressed={selected}
            aria-label={
              scratch
                ? `${label} streichen`
                : `${count} × ${label}, ${value} Punkte`
            }
            onClick={() => onPick(value)}
          >
            {scratch ? (
              <>
                <ScratchMark />
                <span className={styles.points}>0</span>
              </>
            ) : (
              <>
                <span className={styles.count}>{count}</span>
                <span className={styles.points}>{value}</span>
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
