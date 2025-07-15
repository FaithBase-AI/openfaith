import type { AuthData, ZSchema } from '@openfaith/zero/zeroSchema.mts'
import type { CustomMutatorDefs, Transaction } from '@rocicorp/zero'

// Define the input type for creating a person (basic fields for now)
export type UpdatePersonInput = {
  id: string
  firstName?: string
}

export function createMutators(
  authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined,
) {
  return {
    people: {
      update: async (tx: Transaction<ZSchema>, input: UpdatePersonInput): Promise<void> => {
        console.log('update', input)

        if (!authData) {
          throw new Error('Not authenticated')
        }
        // Optionally, add schema validation here
        await tx.mutate.people.update({
          ...input,
        })
      },
    },
  } as const satisfies CustomMutatorDefs<ZSchema>
}

export type Mutators = ReturnType<typeof createMutators>
