/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */

import { auth } from '@openfaith/auth/auth'
import { db } from '@openfaith/db'
import { initTRPC, TRPCError } from '@trpc/server'
import { Option, pipe } from 'effect'
import superjson from 'superjson'
import { ZodError } from 'zod'

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({
    headers: opts.headers,
  })

  const source = opts.headers.get('x-trpc-source') ?? 'unknown'
  console.log('>>> tRPC Request from', source, 'by', session?.user.email)

  return {
    db,
    session,
  }
}

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
  transformer: superjson,
})

/**
 * Create a server-side caller
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now()

  if (t._config.isDev) {
    // artificial delay in dev 100-500ms
    const waitMs = Math.floor(Math.random() * 400) + 100
    await new Promise((resolve) => setTimeout(resolve, waitMs))
  }

  const result = await next()

  const end = Date.now()
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`)

  return result
})

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure.use(timingMiddleware)

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(timingMiddleware).use(({ ctx, next }) =>
  pipe(
    ctx.session,
    Option.fromNullable,
    Option.flatMapNullable((x) => x.user),
    Option.match({
      onNone: () => {
        console.log({
          session: ctx.session,
        })
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      },
      onSome: (x) => {
        return next({
          ctx: {
            session: { ...ctx.session, user: x },
          },
        })
      },
    }),
  ),
)

export const orgProcedure = t.procedure.use(timingMiddleware).use(({ ctx, next }) =>
  pipe(
    ctx.session,
    Option.fromNullable,
    Option.filter((x) => pipe(x.session.activeOrganizationId, Option.fromNullable, Option.isSome)),
    Option.flatMapNullable((x) => x.user),
    Option.match({
      onNone: () => {
        console.log({
          session: ctx.session,
        })
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      },
      onSome: (x) => {
        return next({
          ctx: {
            session: { ...ctx.session, user: x },
          },
        })
      },
    }),
  ),
)

export const adminProcedure = t.procedure.use(timingMiddleware).use(({ ctx, next }) =>
  pipe(
    ctx.session,
    Option.fromNullable,
    Option.flatMapNullable((x) => x.user),
    Option.filter((x) => x.role === 'admin'),
    Option.match({
      onNone: () => {
        console.log({
          session: ctx.session,
        })
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      },
      onSome: (x) => {
        return next({
          ctx: {
            session: { ...ctx.session, user: x },
          },
        })
      },
    }),
  ),
)
