import type { ReactNode } from 'react'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: ReactNode
  /** Auth controls, when a backend is wired up. Absent in local mode. */
  headerActions?: ReactNode
}

/**
 * Frame around the app. Deliberately chrome-free: the game screens carry their
 * own 44px AppBar, and vertical space on a phone belongs to the scorepad. The
 * bar below appears only when there is something to put in it (auth controls).
 */
export function AppShell({ children, headerActions }: AppShellProps) {
  return (
    <div className={styles.shell}>
      {headerActions && (
        <header className={styles.header}>
          <span className={styles.actions}>{headerActions}</span>
        </header>
      )}
      <main className={styles.main}>{children}</main>
    </div>
  )
}
