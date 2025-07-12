import type { AuthData, schema } from '@openfaith/zero/zeroSchema.mts'
import type { CustomMutatorDefs, Transaction } from '@rocicorp/zero'

// Define the input type for creating a person (basic fields for now)
export type CreatePersonInput = {
  id: string
  orgId: string
  firstName?: string
  lastName?: string
  name?: string
  status: 'active' | 'inactive'
  type: 'default'
  createdAt: number
  // Add more fields as needed
}

export function createMutators(
  authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined,
) {
  return {
    person: {
      create: async (tx: Transaction<typeof schema>, input: CreatePersonInput): Promise<void> => {
        if (!authData) {
          throw new Error('Not authenticated')
        }
        // Optionally, add schema validation here
        await tx.mutate.people.insert({
          _tag: 'person',
          ...input,
        })
      },
    },
  } as const satisfies CustomMutatorDefs<typeof schema>
}

export type Mutators = ReturnType<typeof createMutators>
