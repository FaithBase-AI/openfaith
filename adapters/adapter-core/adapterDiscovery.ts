import { FileSystem, Path } from '@effect/platform'
import { Array, Context, Effect, HashMap, Layer, Option, pipe, Schema } from 'effect'

// Schema for adapter metadata
export class AdapterMetadata extends Schema.Class<AdapterMetadata>('AdapterMetadata')({
  clientPath: Schema.Option(Schema.String),
  directory: Schema.String,
  displayName: Schema.String,
  hasClient: Schema.Boolean,
  hasManifest: Schema.Boolean,
  manifestPath: Schema.Option(Schema.String),
  name: Schema.String,
  packageJsonPath: Schema.String,
}) {}

// Error types for adapter discovery
export class AdapterDiscoveryError extends Schema.TaggedError<AdapterDiscoveryError>()(
  'AdapterDiscoveryError',
  {
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
  },
) {}

export class InvalidAdapterError extends Schema.TaggedError<InvalidAdapterError>()(
  'InvalidAdapterError',
  {
    adapterName: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    reason: Schema.String,
  },
) {}

// Helper function to format adapter name for display
const formatAdapterName = (name: string): string => {
  // Convert kebab-case or snake_case to Title Case
  return pipe(
    name,
    (n) => n.replace(/[-_]/g, ' '),
    (n) => n.replace(/\b\w/g, (char) => char.toUpperCase()),
  )
}

// Service interface
export interface AdapterDiscoveryService {
  readonly discoverAdapters: (
    adaptersPath?: string,
  ) => Effect.Effect<ReadonlyArray<AdapterMetadata>, AdapterDiscoveryError>
  readonly getAdapter: (
    adapterName: string,
    adaptersPath?: string,
  ) => Effect.Effect<AdapterMetadata, InvalidAdapterError | AdapterDiscoveryError>
  readonly getAdapterMap: (
    adaptersPath?: string,
  ) => Effect.Effect<HashMap.HashMap<string, AdapterMetadata>, AdapterDiscoveryError>
  readonly listAdapterNames: (
    adaptersPath?: string,
  ) => Effect.Effect<ReadonlyArray<string>, AdapterDiscoveryError>
  readonly hasAdapter: (
    adapterName: string,
    adaptersPath?: string,
  ) => Effect.Effect<boolean, AdapterDiscoveryError>
}

// Service tag
export class AdapterDiscovery extends Context.Tag('@openfaith/adapter-core/AdapterDiscovery')<
  AdapterDiscovery,
  AdapterDiscoveryService
>() {
  static Default = Layer.effect(
    AdapterDiscovery,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const path = yield* Path.Path

      // Helper function to check if a file exists
      const checkFileExists = Effect.fn('checkFileExists')(function* (filePath: string) {
        yield* Effect.annotateCurrentSpan('filePath', filePath)

        return yield* pipe(
          fs.exists(filePath),
          Effect.catchAll(() => Effect.succeed(false)),
        )
      })

      // Helper function to read package.json
      const readPackageJson = Effect.fn('readPackageJson')(function* (packagePath: string) {
        yield* Effect.annotateCurrentSpan('packagePath', packagePath)

        const result = yield* pipe(
          fs.readFileString(packagePath),
          Effect.map((contents) => {
            const parsed = JSON.parse(contents) as { displayName?: string }
            return Option.some(parsed)
          }),
          Effect.orElse(() => Effect.succeed(Option.none<{ displayName?: string }>())),
          Effect.catchAll((error) => {
            // Log the error but don't fail
            return pipe(
              Effect.logError('Failed to read package.json', {
                error,
                packagePath,
              }),
              Effect.as(Option.none<{ displayName?: string }>()),
            )
          }),
        )

        return result
      })

      // Discover all adapters in the adapters directory
      const discoverAdapters = Effect.fn('discoverAdapters')(function* (adaptersPath?: string) {
        // Determine the adapters directory - look up two levels from adapter-core
        const defaultPath = pipe(process.cwd(), (cwd) => {
          // If we're in adapter-core, go up two levels
          if (cwd.endsWith('adapter-core')) {
            return path.dirname(cwd)
          }
          // Otherwise assume we're at the project root
          return path.join(cwd, 'adapters')
        })
        const finalPath = adaptersPath || defaultPath
        yield* Effect.annotateCurrentSpan('adaptersPath', finalPath)

        // Read the adapters directory
        const entries = yield* pipe(
          fs.readDirectory(finalPath),
          Effect.catchAll((error) =>
            Effect.fail(
              new AdapterDiscoveryError({
                cause: error,
                message: 'Failed to scan adapters directory',
              }),
            ),
          ),
        )

        // Filter for directories that have a package.json
        const adapterDirs = yield* pipe(
          entries,
          Array.filter((entry) => {
            // Filter out adapter-core and every-adapter
            return entry !== 'adapter-core' && entry !== 'every-adapter'
          }),
          Array.map((dirName) =>
            Effect.gen(function* () {
              const packageJsonPath = path.join(finalPath, dirName, 'package.json')
              const hasPackageJson = yield* checkFileExists(packageJsonPath)
              if (hasPackageJson) {
                return Option.some({ dirName, packageJsonPath })
              }
              return Option.none()
            }),
          ),
          (effects) => Effect.all(effects, { concurrency: 'unbounded' }),
          Effect.map(Array.getSomes),
        )

        // Convert to adapter metadata
        const adapters = yield* pipe(
          adapterDirs,
          Array.map(({ dirName, packageJsonPath }) =>
            Effect.gen(function* () {
              const adapterDir = path.join(finalPath, dirName)

              // Check for manifest file
              const manifestPath = path.join(adapterDir, 'manifest.ts')
              const hasManifest = yield* checkFileExists(manifestPath)

              // Check for client file
              const clientPath = path.join(adapterDir, 'client.ts')
              const hasClient = yield* checkFileExists(clientPath)

              // Read package.json to get display name
              const packageJson = yield* readPackageJson(packageJsonPath)
              const displayName = pipe(
                packageJson,
                Option.flatMap((pkg) => Option.fromNullable(pkg.displayName)),
                Option.getOrElse(() => formatAdapterName(dirName)),
              )

              return new AdapterMetadata({
                clientPath: hasClient ? Option.some(clientPath) : Option.none(),
                directory: adapterDir,
                displayName,
                hasClient,
                hasManifest,
                manifestPath: hasManifest ? Option.some(manifestPath) : Option.none(),
                name: dirName,
                packageJsonPath,
              })
            }),
          ),
          (effects) => Effect.all(effects, { concurrency: 'unbounded' }),
        )

        yield* Effect.logInfo('Discovered adapters', {
          adapters: pipe(
            adapters,
            Array.map((adapter) => adapter.name),
          ),
          count: pipe(adapters, Array.length),
        })

        return adapters
      })

      // Get a specific adapter by name
      const getAdapter = Effect.fn('getAdapter')(function* (
        adapterName: string,
        adaptersPath?: string,
      ) {
        yield* Effect.annotateCurrentSpan('adapterName', adapterName)

        const allAdapters = yield* discoverAdapters(adaptersPath)

        return yield* pipe(
          allAdapters,
          Array.findFirst((adapter) => adapter.name === adapterName),
          Option.match({
            onNone: () =>
              Effect.fail(
                new InvalidAdapterError({
                  adapterName,
                  reason: 'Adapter not found',
                }),
              ),
            onSome: Effect.succeed,
          }),
        )
      })

      // Get all adapters as a HashMap for quick lookup
      const getAdapterMap = Effect.fn('getAdapterMap')(function* (adaptersPath?: string) {
        const adapters = yield* discoverAdapters(adaptersPath)

        return pipe(
          adapters,
          Array.map((adapter) => [adapter.name, adapter] as const),
          HashMap.fromIterable,
        )
      })

      // List adapter names
      const listAdapterNames = Effect.fn('listAdapterNames')(function* (adaptersPath?: string) {
        const adapters = yield* discoverAdapters(adaptersPath)

        return pipe(
          adapters,
          Array.map((adapter) => adapter.name),
        )
      })

      // Check if an adapter exists
      const hasAdapter = Effect.fn('hasAdapter')(function* (
        adapterName: string,
        adaptersPath?: string,
      ) {
        const adapterOpt = yield* pipe(getAdapter(adapterName, adaptersPath), Effect.option)

        return Option.isSome(adapterOpt)
      })

      return {
        discoverAdapters,
        getAdapter,
        getAdapterMap,
        hasAdapter,
        listAdapterNames,
      }
    }),
  )
}
