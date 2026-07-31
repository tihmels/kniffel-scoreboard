import type { ReactNode } from 'react'
import { Amplify } from 'aws-amplify'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { AppShell } from '../../components/AppShell/AppShell'
import { amplifyOutputs } from '../../services/amplify/client'
import styles from './AuthGate.module.css'

// Configure Amplify as this (lazily-loaded) chunk is imported, i.e. before the
// Authenticator below renders. Only reached when a backend is present.
if (amplifyOutputs) {
  Amplify.configure(amplifyOutputs as Parameters<typeof Amplify.configure>[0])
}

interface AuthenticatedAppProps {
  children: ReactNode
}

export default function AuthenticatedApp({ children }: AuthenticatedAppProps) {
  return (
    <div className={styles.authWrapper}>
      <Authenticator>
        {({ signOut, user }) => {
          const label = user?.signInDetails?.loginId ?? user?.username
          return (
            <AppShell
              headerActions={
                <>
                  {label && <span className={styles.user}>{label}</span>}
                  <button
                    type="button"
                    className={styles.signOut}
                    onClick={signOut}
                  >
                    Sign out
                  </button>
                </>
              }
            >
              {children}
            </AppShell>
          )
        }}
      </Authenticator>
    </div>
  )
}
