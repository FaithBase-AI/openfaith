import { Data, type Array as EArray } from 'effect'

export type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : any

export type Resolve<T> = T extends Function ? T : { [K in keyof T]: T[K] }

export const removeReadonly = <T>(
  arr: Array<T> | ReadonlyArray<T> | EArray.NonEmptyArray<T> | EArray.NonEmptyReadonlyArray<T>,
): Array<T> => arr as Array<T>

export const removeReadonlyNonEmpty = <T>(
  arr: EArray.NonEmptyArray<T> | EArray.NonEmptyReadonlyArray<T>,
): EArray.NonEmptyArray<T> => arr as EArray.NonEmptyArray<T>

export type SyncStatus = Data.TaggedEnum<{
  notSynced: {}
  syncing: {
    current?: number
    total?: number
  }
  synced: {}
  error: {
    message: string
  }
}>
export const SyncStatus = Data.taggedEnum<SyncStatus>()

export type AdapterSyncItem = {
  readonly module: string
  readonly entity: string
  readonly parent?: string
  readonly status: SyncStatus
}

export namespace CaseTransform {
  export type SnakeToPascal<S extends string> = S extends `${infer Head}_${infer Tail}`
    ? `${Capitalize<Head>}${SnakeToPascal<Capitalize<Tail>>}`
    : Capitalize<S>

  export type PascalToSnake<S extends string> = S extends `${infer Head}${infer Tail}`
    ? Head extends Lowercase<Head>
      ? `${Head}${PascalToSnake<Tail>}`
      : `_${Lowercase<Head>}${PascalToSnake<Tail>}`
    : S

  type CleanLeadingUnderscore<S extends string> = S extends `_${infer Rest}` ? Rest : S
  export type PascalToSnakeClean<S extends string> = CleanLeadingUnderscore<PascalToSnake<S>>

  type Pluralize<S extends string> =
    // Irregular plurals
    S extends 'child'
      ? 'children'
      : S extends 'person'
        ? 'people'
        : // Words ending in 'y' preceded by consonant
          S extends `${infer Base}${infer Consonant}y`
          ? Consonant extends 'a' | 'e' | 'i' | 'o' | 'u'
            ? `${S}s`
            : `${Base}${Consonant}ies`
          : // Words ending in s, x, z, ch, sh
            S extends
                | `${infer Base}s`
                | `${infer Base}x`
                | `${infer Base}z`
                | `${infer Base}ch`
                | `${
                    // biome-ignore lint/correctness/noUnusedVariables: this is the way
                    infer Base
                  }sh`
            ? `${S}es`
            : // Words ending in 'f' or 'fe'
              S extends `${infer Base}f`
              ? `${Base}ves`
              : S extends `${infer Base}fe`
                ? `${Base}ves`
                : // Default: add 's'
                  `${S}s`

  type Singularize<S extends string> =
    // Irregular singulars
    S extends 'children'
      ? 'child'
      : S extends 'people'
        ? 'person'
        : // Regular patterns
          S extends `${infer Base}ies`
          ? `${Base}y`
          : S extends `${infer Base}ves`
            ? `${Base}f`
            : S extends `${infer Base}es`
              ? Base extends
                  | `${string}s`
                  | `${string}x`
                  | `${string}z`
                  | `${string}ch`
                  | `${string}sh`
                ? `${Base}`
                : `${Base}e`
              : S extends `${infer Base}s`
                ? Base
                : S

  export type SnakeToPascalPlural<S extends string> = Pluralize<SnakeToPascal<S>>
  export type SnakeToPascalSingular<S extends string> = Singularize<SnakeToPascal<S>>
  export type PascalToSnakePlural<S extends string> = Pluralize<PascalToSnakeClean<S>>
  export type PascalToSnakeSingular<S extends string> = Singularize<PascalToSnakeClean<S>>
  export type SnakePluralToPascalSingular<S extends string> = SnakeToPascal<Singularize<S>>
  export type PascalSingularToSnakePlural<S extends string> = Pluralize<PascalToSnakeClean<S>>
}
