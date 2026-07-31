/**
 * AWS Amplify integration boundary.
 *
 * `amplify_outputs.json` is generated at the project root by the Amplify
 * sandbox (`npm run amplify:sandbox`) and is git-ignored, so it is absent
 * during ordinary local development, in CI, and in tests. We therefore load it
 * *optionally* via `import.meta.glob`: when the file is missing the glob simply
 * matches nothing (no build error), and the app runs in local-only mode.
 *
 * This module deliberately does NOT import `aws-amplify` so that the local-mode
 * bundle stays free of the SDK. Configuration happens in the lazily-loaded
 * authenticated chunk (see features/auth/AuthenticatedApp.tsx).
 *
 * See amplify/data/resource.ts for the data model this client will talk to.
 */
const outputsModules = import.meta.glob<{ default: Record<string, unknown> }>(
  '/amplify_outputs.json',
  { eager: true },
)

/** The generated backend config, or `undefined` when no backend is wired up. */
export const amplifyOutputs = Object.values(outputsModules)[0]?.default

/** True when a deployed/sandbox backend has been wired up (outputs present). */
export const hasAmplifyBackend = amplifyOutputs !== undefined
