/**
 * Enhanced React hooks for Effect-RX that provide a convenient interface
 * for managing asynchronous operations with Effect's type-safe error handling.
 *
 * This module extends @effect-rx/rx-react with additional hooks that follow
 * Effect-TS patterns and conventions, providing:
 *
 * - Type-safe mutation and query hooks with proper Effect error handling
 * - Consistent status management using Effect's tagged enums
 * - Integration with Effect's Option type for nullable values
 * - Full compatibility with Effect's Exit type for result handling
 *
 * @since 1.0.0
 * @module
 */

import type * as Result from '@effect-rx/rx/Result'
import type * as Rx from '@effect-rx/rx/Rx'
import { useRxSetPromise, useRxValue } from '@effect-rx/rx-react'
import type * as Cause from 'effect/Cause'
import * as Data from 'effect/Data'
import * as Exit from 'effect/Exit'
import { pipe } from 'effect/Function'
import * as Option from 'effect/Option'
import * as React from 'react'

/**
 * Re-export all hooks from @effect-rx/rx-react for convenience.
 * This allows users to import everything from a single location.
 *
 * @since 1.0.0
 * @category exports
 */
export * from '@effect-rx/rx-react'

/**
 * @since 1.0.0
 * @category models
 */
export type Status<A = any, E = any> = Data.TaggedEnum<{
  /**
   * Initial state, no mutation has been initiated yet.
   */
  Idle: {}
  /**
   * Mutation is currently in progress.
   */
  Pending: {}
  /**
   * Mutation completed successfully with a value.
   */
  Success: { readonly value: A }
  /**
   * Mutation failed with an error.
   */
  Error: { readonly error: E }
}>

/**
 * @since 1.0.0
 * @category constructors
 */
export const Status = Data.taggedEnum<Status>()

/**
 * @since 1.0.0
 * @category models
 */
export interface RxMutationResult<A, E, W> {
  /**
   * The current status of the mutation.
   */
  readonly status: Status<A, E>
  /**
   * Whether the mutation is in idle state (not initiated).
   */
  readonly isIdle: boolean
  /**
   * Whether the mutation is currently pending.
   */
  readonly isPending: boolean
  /**
   * Whether the mutation completed successfully.
   */
  readonly isSuccess: boolean
  /**
   * Whether the mutation failed with an error.
   */
  readonly isError: boolean
  /**
   * The last exit result from the mutation, if any.
   */
  readonly lastExitOpt: Option.Option<Exit.Exit<A, E>>
  /**
   * The variables used in the last mutation call, if any.
   */
  readonly variablesOpt: Option.Option<W>
  /**
   * Number of times the mutation has been called.
   */
  readonly callCount: number
  /**
   * Timestamp of when the mutation was last submitted.
   */
  readonly submittedAt: number
  /**
   * Execute the mutation with the provided variables.
   * This will not return the result, use `mutateAsync` if you need the result.
   */
  readonly mutate: (vars: W) => void
  /**
   * Execute the mutation with the provided variables and return the Exit result.
   * This is useful when you need to handle the result in a promise chain.
   */
  readonly mutateAsync: (vars: W) => Promise<Exit.Exit<A, E>>
  /**
   * Reset the mutation state to idle.
   */
  readonly reset: () => void
}

/**
 * A hook that provides a convenient interface for managing mutations with Effect-RX.
 *
 * This hook integrates with Effect's Result and Exit types to provide type-safe
 * error handling and state management for asynchronous mutations.
 *
 * @since 1.0.0
 * @category hooks
 * @param rx - A writable Rx that produces a Result
 * @returns An object containing the mutation state and control functions
 *
 * @example
 * ```typescript
 * import { Rx } from '@effect-rx/rx'
 * import { Effect } from 'effect'
 *
 * const saveUserRx = Rx.family((id: string) =>
 *   Rx.fn((data: UserData) =>
 *     Effect.gen(function* () {
 *       const client = yield* UserService
 *       return yield* client.saveUser(id, data)
 *     })
 *   )
 * )
 *
 * function UserForm({ userId }: { userId: string }) {
 *   const mutation = useRxMutation(saveUserRx(userId))
 *
 *   const handleSubmit = (data: UserData) => {
 *     mutation.mutate(data)
 *   }
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {mutation.isError && <div>Error saving user</div>}
 *       {mutation.isSuccess && <div>User saved successfully!</div>}
 *       <button disabled={mutation.isPending}>
 *         {mutation.isPending ? 'Saving...' : 'Save'}
 *       </button>
 *     </form>
 *   )
 * }
 * ```
 */
export const useRxMutation = <E, A, W>(
  rx: Rx.Writable<Result.Result<A, E>, W>,
): RxMutationResult<A, E, W> => {
  const mutateAsyncImpl = useRxSetPromise<E, A, W>(rx)
  const [status, setStatus] = React.useState<Status<A, E>>(Status.Idle())
  const [lastExitOpt, setLastExitOpt] = React.useState<Option.Option<Exit.Exit<A, E>>>(
    Option.none(),
  )
  const [variablesOpt, setVariablesOpt] = React.useState<Option.Option<W>>(Option.none())
  const [callCount, setCallCount] = React.useState(0)
  const [submittedAt, setSubmittedAt] = React.useState<number>(0)

  const reset = React.useCallback(() => {
    setStatus(Status.Idle())
    setLastExitOpt(Option.none())
    setVariablesOpt(Option.none())
    setCallCount(0)
    setSubmittedAt(0)
  }, [])

  const mutate = React.useCallback(
    (vars: W) => {
      setStatus(Status.Pending())
      setVariablesOpt(Option.some(vars))
      setSubmittedAt(Date.now())
      setCallCount((c) => c + 1)
      mutateAsyncImpl(vars).then((exit) => {
        setLastExitOpt(Option.some(exit))
        pipe(
          exit,
          Exit.match({
            onFailure: (error) => setStatus(Status.Error({ error })),
            onSuccess: (value) => setStatus(Status.Success({ value })),
          }),
        )
      })
    },
    [mutateAsyncImpl],
  )

  const mutateAsync = React.useCallback(
    async (vars: W) => {
      setStatus(Status.Pending())
      setVariablesOpt(Option.some(vars))
      setSubmittedAt(Date.now())
      setCallCount((c) => c + 1)
      const exit = await mutateAsyncImpl(vars)
      setLastExitOpt(Option.some(exit))
      pipe(
        exit,
        Exit.match({
          onFailure: (error) => setStatus(Status.Error({ error })),
          onSuccess: (value) => setStatus(Status.Success({ value })),
        }),
      )
      return exit
    },
    [mutateAsyncImpl],
  )

  return {
    callCount,
    isError: status._tag === 'Error',
    isIdle: status._tag === 'Idle',
    isPending: status._tag === 'Pending',
    isSuccess: status._tag === 'Success',
    lastExitOpt,
    mutate,
    mutateAsync,
    reset,
    status,
    submittedAt,
    variablesOpt,
  }
}

/**
 * @since 1.0.0
 * @category models
 */
export interface RxQueryResult<A, E> {
  /**
   * The current status of the query.
   */
  readonly status: Status<A, E>
  /**
   * Whether the query hasn't been initiated or is waiting for initial data.
   */
  readonly isIdle: boolean
  /**
   * Whether the query is currently loading.
   */
  readonly isPending: boolean
  /**
   * Whether the query completed successfully.
   */
  readonly isSuccess: boolean
  /**
   * Whether the query failed with an error.
   */
  readonly isError: boolean
  /**
   * The data from a successful query, if available.
   */
  readonly dataOpt: Option.Option<A>
  /**
   * The error cause from a failed query, if available.
   * Use Cause.failures() or Cause.failureOption() to extract the actual error.
   */
  readonly errorCauseOpt: Option.Option<Cause.Cause<E>>
}

/**
 * A hook that provides a convenient interface for consuming query results with Effect-RX.
 *
 * This hook automatically subscribes to an Rx that produces a Result and provides
 * a consistent interface for handling loading, success, and error states.
 *
 * @since 1.0.0
 * @category hooks
 * @param rx - An Rx that produces a Result
 * @returns An object containing the query state and data
 *
 * @example
 * ```typescript
 * import { Rx } from '@effect-rx/rx'
 * import { Effect } from 'effect'
 *
 * const userRx = Rx.family((id: string) =>
 *   Rx.fn(() =>
 *     Effect.gen(function* () {
 *       const client = yield* UserService
 *       return yield* client.getUser(id)
 *     })
 *   )
 * )
 *
 * function UserProfile({ userId }: { userId: string }) {
 *   const query = useRxQuery(userRx(userId))
 *
 *   if (query.isPending) {
 *     return <div>Loading...</div>
 *   }
 *
 *   if (query.isError) {
 *     return <div>Error loading user</div>
 *   }
 *
 *   return pipe(
 *     query.dataOpt,
 *     Option.match({
 *       onNone: () => <div>No user found</div>,
 *       onSome: (user) => <div>{user.name}</div>
 *     })
 *   )
 * }
 * ```
 */
export const useRxQuery = <E, A>(rx: Rx.Rx<Result.Result<A, E>>): RxQueryResult<A, E> => {
  const result = useRxValue(rx)

  // Handle initial state
  if (result._tag === 'Initial') {
    return {
      dataOpt: Option.none(),
      errorCauseOpt: Option.none(),
      isError: false,
      isIdle: true,
      isPending: false,
      isSuccess: false,
      status: Status.Idle(),
    }
  }

  // Handle loading state
  if (result.waiting) {
    // If we have previous data/error, maintain it while loading
    if (result._tag === 'Success') {
      return {
        dataOpt: Option.some(result.value),
        errorCauseOpt: Option.none(),
        isError: false,
        isIdle: false,
        isPending: true,
        isSuccess: false,
        status: Status.Pending(),
      }
    }
    if (result._tag === 'Failure') {
      return {
        dataOpt: Option.none(),
        errorCauseOpt: Option.some(result.cause),
        isError: false,
        isIdle: false,
        isPending: true,
        isSuccess: false,
        status: Status.Pending(),
      }
    }
    return {
      dataOpt: Option.none(),
      errorCauseOpt: Option.none(),
      isError: false,
      isIdle: false,
      isPending: true,
      isSuccess: false,
      status: Status.Pending(),
    }
  }

  // Handle success state
  if (result._tag === 'Success') {
    return {
      dataOpt: Option.some(result.value),
      errorCauseOpt: Option.none(),
      isError: false,
      isIdle: false,
      isPending: false,
      isSuccess: true,
      status: Status.Success({ value: result.value }),
    }
  }

  // Handle failure state
  return {
    dataOpt: Option.none(),
    errorCauseOpt: Option.some(result.cause),
    isError: true,
    isIdle: false,
    isPending: false,
    isSuccess: false,
    status: Status.Error({ error: result.cause }),
  }
}

/**
 * Options for configuring the behavior of useRxInfiniteQuery.
 *
 * @since 1.0.0
 * @category models
 */
export interface UseRxInfiniteQueryOptions<PageParam> {
  /**
   * Function to get the next page parameter from the current page data.
   */
  readonly getNextPageParam?: (
    lastPage: unknown,
    pages: ReadonlyArray<unknown>,
  ) => Option.Option<PageParam>
  /**
   * Function to get the previous page parameter from the current page data.
   */
  readonly getPreviousPageParam?: (
    firstPage: unknown,
    pages: ReadonlyArray<unknown>,
  ) => Option.Option<PageParam>
}

/**
 * @since 1.0.0
 * @category models
 */
export interface RxInfiniteQueryResult<A, E> extends RxQueryResult<ReadonlyArray<A>, E> {
  /**
   * Fetch the next page of results.
   */
  readonly fetchNextPage: () => void
  /**
   * Fetch the previous page of results.
   */
  readonly fetchPreviousPage: () => void
  /**
   * Whether there is a next page to fetch.
   */
  readonly hasNextPage: boolean
  /**
   * Whether there is a previous page to fetch.
   */
  readonly hasPreviousPage: boolean
  /**
   * Whether currently fetching the next page.
   */
  readonly isFetchingNextPage: boolean
  /**
   * Whether currently fetching the previous page.
   */
  readonly isFetchingPreviousPage: boolean
}

/**
 * A utility function to create a Status from an Exit.
 *
 * @since 1.0.0
 * @category constructors
 * @param exit - The Exit to convert to a Status
 * @returns A Status representing the Exit result
 */
export const statusFromExit = <A, E>(exit: Exit.Exit<A, E>): Status<A, E> =>
  pipe(
    exit,
    Exit.match({
      onFailure: (error) => Status.Error({ error }),
      onSuccess: (value) => Status.Success({ value }),
    }),
  )

/**
 * A utility function to get the data from a Status if it's successful.
 *
 * @since 1.0.0
 * @category utils
 * @param status - The Status to extract data from
 * @returns An Option containing the data if successful
 */
export const getStatusData = <A, E>(status: Status<A, E>): Option.Option<A> =>
  status._tag === 'Success' ? Option.some(status.value) : Option.none()

/**
 * A utility function to get the error from a Status if it failed.
 *
 * @since 1.0.0
 * @category utils
 * @param status - The Status to extract error from
 * @returns An Option containing the error if failed
 */
export const getStatusError = <A, E>(status: Status<A, E>): Option.Option<E> =>
  status._tag === 'Error' ? Option.some(status.error) : Option.none()
