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
