import { fixedValue, inputKind } from '../../domain/scoring'
import type { ScoreCategory, UpperCategory } from '../../domain/scoring'
import { CountPicker } from './CountPicker'
import { FixedPicker } from './FixedPicker'
import { CATEGORY_LABELS } from './labels'
import { ScratchMark } from './ScratchMark'
import styles from './CategoryRow.module.css'

interface CategoryRowProps {
  category: ScoreCategory
  value: number | undefined
  editing: boolean
  /** Accent note above the control, e.g. what secures the bonus. */
  hint?: string
  onPick: (value: number) => void
  onOpenSheet: () => void
  onStartEdit: () => void
  onCancelEdit: () => void
  onClear: () => void
}

/**
 * One line of the scorepad. Filled lines collapse to a summary so the card
 * shrinks as the game goes on; open lines carry their own control, which is
 * what keeps ten of thirteen categories at a single tap.
 */
export function CategoryRow({
  category,
  value,
  editing,
  hint,
  onPick,
  onOpenSheet,
  onStartEdit,
  onCancelEdit,
  onClear,
}: CategoryRowProps) {
  const label = CATEGORY_LABELS[category]
  const filled = value !== undefined
  const kind = inputKind(category)

  if (filled && !editing) {
    const scratched = value === 0
    return (
      <button
        type="button"
        className={`${styles.filled} ${scratched ? styles.isScratched : ''}`}
        onClick={onStartEdit}
        aria-label={
          scratched
            ? `${label}, gestrichen — ändern`
            : `${label}, ${value} Punkte — ändern`
        }
      >
        <span className={styles.filledLabel}>{label}</span>
        {scratched ? (
          <>
            <span className={styles.scratchedWord}>gestrichen</span>
            <ScratchMark boxed />
          </>
        ) : (
          <span className={styles.value}>{value}</span>
        )}
        <span className={styles.chevron} aria-hidden="true">
          ›
        </span>
      </button>
    )
  }

  const picker =
    kind === 'count' ? (
      <CountPicker
        category={category as UpperCategory}
        current={value}
        onPick={onPick}
      />
    ) : (
      <FixedPicker
        category={category}
        value={fixedValue(category)}
        current={value}
        onPick={onPick}
        onOpenSheet={onOpenSheet}
      />
    )

  // A fixed or free-sum row fits its label on the same line as its two targets;
  // the count picker needs the full width, so its label sits above.
  const inlineLabel = kind !== 'count' && !editing

  return (
    <div className={`${styles.open} ${editing ? styles.editing : ''}`}>
      {inlineLabel ? (
        <div className={styles.inline}>
          <span className={styles.openLabel}>{label}</span>
          {picker}
        </div>
      ) : (
        <>
          <div className={styles.head}>
            <span className={styles.openLabel}>
              {label}
              {editing && ' — ändern'}
            </span>
            {editing ? (
              <span className={styles.note}>
                {value === 0 ? 'jetzt gestrichen' : `jetzt ${value}`}
              </span>
            ) : (
              hint && <span className={styles.note}>{hint}</span>
            )}
          </div>
          {picker}
        </>
      )}

      {editing && (
        <div className={styles.editActions}>
          <button
            type="button"
            className={styles.editAction}
            onClick={onCancelEdit}
          >
            Abbrechen
          </button>
          <button type="button" className={styles.editAction} onClick={onClear}>
            Feld leeren
          </button>
        </div>
      )}
    </div>
  )
}
