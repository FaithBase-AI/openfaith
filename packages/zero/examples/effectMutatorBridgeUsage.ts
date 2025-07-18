import { Effect } from 'effect'
import { createMutatorsEf } from '../effectMutatorsExample'

/**
 * Example showing how to use the new Effect-based mutator API
 */
export function exampleUsage() {
  return Effect.gen(function* () {
    const authData = {
      activeOrganizationId: 'org-456',
      sub: 'user-123',
    }

    // Create Effect-based mutators - this is the clean API you wanted!
    const effectMutators = createMutatorsEf(authData)

    yield* Effect.log('Created Effect-based mutators:', effectMutators)

    // These mutators can now be used with appZeroStore.processZeroEffectMutations()
    // The bridge will automatically convert them to Promise-based mutators for Zero

    return effectMutators
  })
}

/**
 * Example showing how this would be used in a handler
 */
export function exampleHandlerUsage() {
  return Effect.gen(function* () {
    // This is how you'd use it in the actual handler:

    // const session = yield* SessionContext
    // const appZeroStore = yield* AppZeroStore

    // const result = yield* appZeroStore.processZeroEffectMutations(
    //   createMutatorsEf({
    //     activeOrganizationId: pipe(session.activeOrganizationIdOpt, Option.getOrNull),
    //     sub: session.userId,
    //   }),
    //   input.urlParams,
    //   input.payload as unknown as ReadonlyJSONObject,
    // )

    yield* Effect.log('Handler would use processZeroEffectMutations method')
  })
}
