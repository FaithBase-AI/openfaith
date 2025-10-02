import { schema } from '@openfaith/db'
import { env } from '@openfaith/shared'
import { schema as zSchema } from '@openfaith/zero'
import {
  type DBConnection,
  type DBTransaction,
  PushProcessor,
  type Row,
  ZQLDatabase,
} from '@rocicorp/zero/server'
import { SQL, type TransactionSQL } from 'bun'
import { drizzle } from 'drizzle-orm/bun-sql'

const connection = new SQL({
  database: env.DB_NAME,
  host: env.DB_HOST_PRIMARY,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,
  ssl: false,
  user: env.DB_USERNAME,
})

export const db = drizzle(connection, {
  schema,
})

export class BunSQLConnection implements DBConnection<SQL> {
  readonly #client: SQL
  constructor(client: SQL) {
    this.#client = client
  }

  transaction<TRet>(fn: (tx: DBTransaction<TransactionSQL>) => Promise<TRet>): Promise<TRet> {
    // Bun SQL transactions use .begin()
    return this.#client.begin((sqlTx) => fn(new BunSQLTransaction(sqlTx))) as Promise<TRet>
  }
}

class BunSQLTransaction implements DBTransaction<TransactionSQL> {
  readonly wrappedTransaction: TransactionSQL

  constructor(sqlTx: TransactionSQL) {
    this.wrappedTransaction = sqlTx
  }

  query(sql: string, params: Array<unknown>): Promise<Array<Row>> {
    // Same API as postgres.js!
    return this.wrappedTransaction.unsafe(sql, params)
  }
}

const zeroDb = new ZQLDatabase(new BunSQLConnection(connection), zSchema)

export const zeroPushProcessor = new PushProcessor(zeroDb)
