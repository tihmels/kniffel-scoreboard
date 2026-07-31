import { defineBackend } from '@aws-amplify/backend'
import { auth } from './auth/resource'
import { data } from './data/resource'

/**
 * Amplify Gen 2 backend definition.
 * https://docs.amplify.aws/react/build-a-backend/
 */
defineBackend({
  auth,
  data,
})
