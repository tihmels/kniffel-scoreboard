import { defineAuth } from '@aws-amplify/backend'

/**
 * Cognito user pool with email sign-in.
 * https://docs.amplify.aws/react/build-a-backend/auth/
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
})
