import { type ClientSchema, a, defineData } from '@aws-amplify/backend'

/**
 * Data model backed by AppSync + DynamoDB. This is a minimal starting point for
 * cloud persistence of scoreboards (Milestone: cloud persistence). The full
 * per-turn scoring shape will be modelled once the domain rules are finalised.
 *
 * Every Game is owner-scoped: a signed-in user can only read/write their own.
 * https://docs.amplify.aws/react/build-a-backend/data/
 */
const schema = a.schema({
  Game: a
    .model({
      name: a.string().required(),
      players: a.string().array(),
      completedAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
})
