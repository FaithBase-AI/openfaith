import { Effect } from 'effect'
import { EnvLayer, PcoSyncWorkflow } from './index.js'

// Example runner that executes the PCO sync workflow
const runPcoSync = (tokenKey: string) => {
  return PcoSyncWorkflow.execute({
    tokenKey,
  }).pipe(
    Effect.provide(EnvLayer),
    Effect.tapErrorCause(Effect.logError),
    Effect.tap(() => Effect.log(`Successfully completed PCO sync for token: ${tokenKey}`)),
  )
}

// Example usage (you can uncomment and modify as needed)
// const main = runPcoSync("org_01jww7zkeyfzvsxd20nfjzc21z")

// NodeRuntime.runMain(main)

export { runPcoSync }
