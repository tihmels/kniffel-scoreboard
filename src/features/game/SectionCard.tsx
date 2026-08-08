import type { ReactNode } from 'react'
import styles from './SectionCard.module.css'

interface SectionCardProps {
  title: string
  /** Running subtotal, plus the bonus countdown for the upper section. */
  summary: string
  emphasis?: boolean
  children: ReactNode
}

export function SectionCard({
  title,
  summary,
  emphasis = false,
  children,
}: SectionCardProps) {
  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        <span className={`${styles.summary} ${emphasis ? styles.live : ''}`}>
          {summary}
        </span>
      </header>
      {children}
    </section>
  )
}
