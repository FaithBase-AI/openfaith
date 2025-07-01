import type { EntityManifestShape } from '@openfaith/adapter-core/server'
import { Context } from 'effect'

export class EntityManifest extends Context.Tag('@openfaith/adapter-core/EntityManifest')<
  EntityManifest,
  EntityManifestShape
>() {}
