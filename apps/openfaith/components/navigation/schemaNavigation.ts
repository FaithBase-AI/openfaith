import { discoverUiEntities } from '@openfaith/schema'
import { loadAllEntityIcons, useEntityIcons } from '@openfaith/ui'
import { Array, pipe } from 'effect'

// Re-export for backward compatibility
export { loadAllEntityIcons, useEntityIcons }

export const getNavigationByModule = () => {
  const entities = discoverUiEntities()

  return pipe(
    entities,
    Array.groupBy((entity) => entity.navConfig.module),
  )
}
