import type { ReactNode } from 'react'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.logo} aria-hidden="true">
            🎲
          </span>
          <span className={styles.title}>Kniffel Scoreboard</span>
          <span className={styles.tag}>Local · Milestone 1</span>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          A learning project · React · TypeScript · AWS Amplify
        </div>
      </footer>
    </div>
  )
}
