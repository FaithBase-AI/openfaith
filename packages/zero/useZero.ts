import type { ZSchema } from '@openfaith/zero/zeroSchema.mjs'
import { createUseZero } from '@rocicorp/zero/react'

export const useZero = createUseZero<ZSchema>()
