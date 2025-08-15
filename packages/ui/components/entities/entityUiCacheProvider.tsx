'use client'

import { useEntityCacheInitializer } from '@openfaith/ui/shared/hooks/schemaHooks'
import type { FC } from 'react'

export const EntityUiCacheProvider: FC = () => {
  useEntityCacheInitializer()
  return null
}
