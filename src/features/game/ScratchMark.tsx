import styles from './ScratchMark.module.css'

interface ScratchMarkProps {
  /** Draw the surrounding box, as a filled cell does; bare inside a button. */
  boxed?: boolean
}

/**
 * The paper scorepad's diagonal slash. The one and only sign for "deliberately
 * zero" — an open category is always blank instead, never a 0.
 */
export function ScratchMark({ boxed = false }: ScratchMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.mark} ${boxed ? styles.boxed : ''}`}
    />
  )
}
