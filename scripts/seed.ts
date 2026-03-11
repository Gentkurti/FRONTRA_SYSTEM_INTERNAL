/**
 * Seed script to create users.
 * Run: npx tsx scripts/seed.ts
 *
 * Set SEED_USERS in .env.local: "anna:password123,john:secret456"
 * Or pass as arg: npx tsx scripts/seed.ts "anna:password123" "john:secret456"
 */

import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcrypt'
import { config } from 'dotenv'

config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function seed() {
  const usersInput = process.env.SEED_USERS || process.argv.slice(2).join(',')
  if (!usersInput.trim()) {
    console.error('Ange användare. Exempel: SEED_USERS="anna:lösenord1,john:lösenord2" npx tsx scripts/seed.ts')
    console.error('Eller: npx tsx scripts/seed.ts "anna:lösenord1" "john:lösenord2"')
    process.exit(1)
  }

  const pairs = usersInput.split(',').map((s) => s.trim()).filter(Boolean)
  for (const pair of pairs) {
    const [name, password] = pair.split(':')
    if (!name || !password) {
      console.error(`Ogiltigt format: "${pair}". Använd namn:lösenord`)
      continue
    }

    const normalizedName = name.trim().toLowerCase().replace(/\s+/g, '')
    const passwordHash = await bcrypt.hash(password, 10)

    try {
      await sql`
        INSERT INTO users (name, password_hash, display_name)
        VALUES (${normalizedName}, ${passwordHash}, ${name.trim()})
        ON CONFLICT (name) DO UPDATE SET password_hash = EXCLUDED.password_hash
      `
      console.log(`Skapade/uppdaterade användare: ${name}`)
    } catch (err) {
      console.error(`Kunde inte skapa ${name}:`, err)
    }
  }
  console.log('Klart!')
}

seed()
