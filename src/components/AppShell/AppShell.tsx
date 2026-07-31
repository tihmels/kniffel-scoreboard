import type { ReactNode } from 'react'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: ReactNode
  /** Optional content shown on the right of the header (e.g. auth controls). */
  headerActions?: ReactNode
}

export function AppShell({ children, headerActions }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.logo} aria-hidden="true">
            🎲
          </span>
          <span className={styles.title}>Kniffel Scoreboard</span>
          {headerActions && (
            <span className={styles.actions}>{headerActions}</span>
          )}
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
