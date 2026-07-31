/**
 * AWS Amplify integration boundary.
 *
 * This module is intentionally inert for Milestone 1: local frontend
 * development must NOT require AWS credentials or a deployed backend.
 *
 * Once the Amplify sandbox (or a deployed environment) has generated
 * `amplify_outputs.json` at the project root, activate the backend by
 * uncommenting the code below and calling `configureAmplify()` once, early in
 * `src/main.tsx`. The generated file is git-ignored, so it is only present
 * after `npm run amplify:sandbox`.
 *
 * See amplify/data/resource.ts for the data model this client will talk to.
 */

// import { Amplify } from 'aws-amplify'
// import { generateClient } from 'aws-amplify/data'
// import outputs from '../../../amplify_outputs.json'
// import type { Schema } from '../../../amplify/data/resource'

export function configureAmplify(): void {
  // Amplify.configure(outputs)
}

// export const dataClient = generateClient<Schema>()
