import styles from './TurnHeader.module.css'

interface TurnHeaderProps {
  name: string
  onPrevious: () => void
  onNext: () => void
}

/**
 * Whose card is on screen. The prediction from turn order is only a hint — the
 * arrows move it freely, so a skipped or out-of-order turn never blocks entry.
 */
export function TurnHeader({ name, onPrevious, onNext }: TurnHeaderProps) {
  return (
    <div className={styles.header}>
      <button
        type="button"
        className={styles.step}
        aria-label="Vorheriger Spieler"
        onClick={onPrevious}
      >
        ◂
      </button>
      <div className={styles.who}>
        <div className={styles.name}>{name} ist dran</div>
        <div className={styles.hint}>
          Kategorie antippen — Wert direkt daneben
        </div>
      </div>
      <button
        type="button"
        className={styles.step}
        aria-label="Nächster Spieler"
        onClick={onNext}
      >
        ▸
      </button>
    </div>
  )
}
