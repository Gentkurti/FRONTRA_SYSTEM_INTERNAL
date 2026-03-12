import { neon } from '@neondatabase/serverless'

type NeonClient = ReturnType<typeof neon>

let client: NeonClient | null = null

function getClient(): NeonClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'No database connection string was provided to `neon()`. Perhaps an environment variable has not been set?'
    )
  }
  if (!client) {
    client = neon(process.env.DATABASE_URL)
  }
  return client
}

// Lazy init: anropa neon() först vid första query så att build på Vercel inte kräver DATABASE_URL.
function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<Record<string, unknown>[]> {
  return getClient()(strings, ...values) as Promise<Record<string, unknown>[]>
}
// Rader som returneras från sql – använd denna typ där du behöver fälttyper (t.ex. existing.amount_kr).
export type SqlRow = Record<string, unknown>

export { sql }
