import { expect } from 'bun:test'
import * as Statement from '@effect/sql/Statement'
import { effect, layer } from '@openfaith/bun-test'
import { Effect, String } from 'effect'
import * as PgClient from '../src/PgClient.js'
import { PgContainer } from './utils.js'

const compilerTransform = PgClient.makeCompiler(String.camelToSnake)
const transformsNested = Statement.defaultTransforms(String.snakeToCamel)
const transforms = Statement.defaultTransforms(String.snakeToCamel, false)

// Test the compiler and transforms without requiring database connection
effect('makeCompiler creates working compiler', () =>
  Effect.sync(() => {
    const compiler = PgClient.makeCompiler()
    expect(compiler).toBeDefined()
    expect(typeof compiler.compile).toBe('function')
  }),
)

effect('makeCompiler with transforms', () =>
  Effect.sync(() => {
    const compiler = PgClient.makeCompiler(String.camelToSnake)
    expect(compiler).toBeDefined()
    expect(typeof compiler.compile).toBe('function')
  }),
)

effect('transform nested', () =>
  Effect.sync(() => {
    expect(
      transformsNested.array([
        {
          a_key: 1,
          arr_primitive: [1, '2', true],
          nested: [{ b_key: 2 }],
        },
      ]) as any,
    ).toEqual([
      {
        aKey: 1,
        arrPrimitive: [1, '2', true],
        nested: [{ bKey: 2 }],
      },
    ])
  }),
)

effect('transform non nested', () =>
  Effect.sync(() => {
    expect(
      transforms.array([
        {
          a_key: 1,
          arr_primitive: [1, '2', true],
          nested: [{ b_key: 2 }],
        },
      ]) as any,
    ).toEqual([
      {
        aKey: 1,
        arrPrimitive: [1, '2', true],
        nested: [{ b_key: 2 }],
      },
    ])

    expect(
      transforms.array([
        {
          json_field: {
            test_nested: {
              test_value: [1, true, null, 'text'],
            },
            test_value: [1, true, null, 'text'],
          },
        },
      ]) as any,
    ).toEqual([
      {
        jsonField: {
          test_nested: {
            test_value: [1, true, null, 'text'],
          },
          test_value: [1, true, null, 'text'],
        },
      },
    ])
  }),
)

// Database connectivity tests with container
layer(PgContainer.ClientLive, { timeout: 60_000 })('PgClient Database Tests', (it) => {
  it.effect('basic connectivity test', () =>
    Effect.gen(function* () {
      const sql = yield* PgClient.PgClient
      const result = yield* sql`SELECT 1 as test`
      expect(result).toEqual([{ test: 1 }])
    }),
  )

  it.effect('insert helper compilation', () =>
    Effect.gen(function* () {
      const sql = yield* PgClient.PgClient
      const [query, params] =
        sql`INSERT INTO people ${sql.insert({ age: 10, name: 'Tim' })}`.compile()
      expect(query).toEqual(`INSERT INTO people ("age","name") VALUES ($1,$2)`)
      expect(params).toEqual([10, 'Tim'])
    }),
  )

  it.effect('updateValues helper compilation', () =>
    Effect.gen(function* () {
      const sql = yield* PgClient.PgClient
      const [query, params] = sql`UPDATE people SET name = data.name FROM ${sql.updateValues(
        [{ name: 'Tim' }, { name: 'John' }],
        'data',
      )}`.compile()
      expect(query).toEqual(
        `UPDATE people SET name = data.name FROM (values ($1),($2)) AS data("name")`,
      )
      expect(params).toEqual(['Tim', 'John'])
    }),
  )

  it.effect('update helper compilation', () =>
    Effect.gen(function* () {
      const sql = yield* PgClient.PgClient
      let result = sql`UPDATE people SET ${sql.update({ name: 'Tim' })}`.compile()
      expect(result[0]).toEqual(`UPDATE people SET "name" = $1`)
      expect(result[1]).toEqual(['Tim'])

      result = sql`UPDATE people SET ${sql.update({ age: 10, name: 'Tim' }, ['age'])}`.compile()
      expect(result[0]).toEqual(`UPDATE people SET "name" = $1`)
      expect(result[1]).toEqual(['Tim'])
    }),
  )

  it.effect('array helper compilation', () =>
    Effect.gen(function* () {
      const sql = yield* PgClient.PgClient
      const [query, params] =
        sql`SELECT * FROM ${sql('people')} WHERE id IN ${sql.in([1, 2, 'string'])}`.compile()
      expect(query).toEqual(`SELECT * FROM "people" WHERE id IN ($1,$2,$3)`)
      expect(params).toEqual([1, 2, 'string'])
    }),
  )

  it.effect('array helper with column compilation', () =>
    Effect.gen(function* () {
      const sql = yield* PgClient.PgClient
      let result =
        sql`SELECT * FROM ${sql('people')} WHERE ${sql.in('id', [1, 2, 'string'])}`.compile()
      expect(result[0]).toEqual(`SELECT * FROM "people" WHERE "id" IN ($1,$2,$3)`)
      expect(result[1]).toEqual([1, 2, 'string'])

      result = sql`SELECT * FROM ${sql('people')} WHERE ${sql.in('id', [])}`.compile()
      expect(result[0]).toEqual(`SELECT * FROM "people" WHERE 1=0`)
      expect(result[1]).toEqual([])
    }),
  )

  it.effect('and compilation', () =>
    Effect.gen(function* () {
      const sql = yield* PgClient.PgClient
      const now = new Date()
      const result = sql`SELECT * FROM ${sql('people')} WHERE ${sql.and([
        sql.in('name', ['Tim', 'John']),
        sql`created_at < ${now}`,
      ])}`.compile()
      expect(result[0]).toEqual(
        `SELECT * FROM "people" WHERE ("name" IN ($1,$2) AND created_at < $3)`,
      )
      expect(result[1]).toEqual(['Tim', 'John', now])
    }),
  )

  it.effect('json compilation', () =>
    Effect.gen(function* () {
      const sql = yield* PgClient.PgClient
      const [query, params] = sql`SELECT ${sql.json({ a: 1 })}`.compile()
      expect(query).toEqual(`SELECT $1`)
      expect(params).toHaveLength(1)
      expect(params[0]).toEqual({ a: 1 })
    }),
  )

  it.effect('array compilation', () =>
    Effect.gen(function* () {
      const sql = yield* PgClient.PgClient
      const [query, params] = sql`SELECT ${sql.array([1, 2, 3])}`.compile()
      expect(query).toEqual(`SELECT $1`)
      expect(params).toHaveLength(1)
      expect(params[0]).toEqual([1, 2, 3])
    }),
  )

  it.effect('onDialect', () =>
    Effect.gen(function* () {
      const sql = yield* PgClient.PgClient
      expect(
        sql.onDialect({
          clickhouse: () => 'E',
          mssql: () => 'D',
          mysql: () => 'C',
          pg: () => 'B',
          sqlite: () => 'A',
        }),
      ).toBe('B')
      expect(
        sql.onDialectOrElse({
          orElse: () => 'A',
          pg: () => 'B',
        }),
      ).toBe('B')
    }),
  )

  it.effect('identifier transform', () =>
    Effect.gen(function* () {
      const sql = yield* PgClient.PgClient
      const [query] = compilerTransform.compile(sql`SELECT * from ${sql('peopleTest')}`, false)
      expect(query).toEqual(`SELECT * from "people_test"`)
    }),
  )
})

layer(PgContainer.ClientTransformLive, { timeout: 60_000 })('PgClient Transform Tests', (it) => {
  it.effect('insert helper with transforms', () =>
    Effect.gen(function* () {
      const sql = yield* PgClient.PgClient
      const [query, params] =
        sql`INSERT INTO people ${sql.insert({ age: 10, firstName: 'Tim' })}`.compile()
      expect(query).toEqual(`INSERT INTO people ("age","first_name") VALUES ($1,$2)`)
      expect(params).toEqual([10, 'Tim'])
    }),
  )

  it.effect('insert helper withoutTransforms', () =>
    Effect.gen(function* () {
      const sql = (yield* PgClient.PgClient).withoutTransforms()
      const [query, params] =
        sql`INSERT INTO people ${sql.insert({ age: 10, first_name: 'Tim' })}`.compile()
      expect(query).toEqual(`INSERT INTO people ("age","first_name") VALUES ($1,$2)`)
      expect(params).toEqual([10, 'Tim'])
    }),
  )
})
