import { Effect } from 'effect'

export const noOp = () => {}
export const nullOp = () => null
export const asyncNoOp = async () => {}
export const asyncNullOp = async () => null

export const nullOpE = () => Effect.succeed(null)
