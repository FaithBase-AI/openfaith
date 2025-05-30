import type { Array as EArray } from 'effect'

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
