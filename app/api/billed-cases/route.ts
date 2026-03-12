import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get('year') ?? '', 10)
  const month = parseInt(searchParams.get('month') ?? '', 10)
  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json({ error: 'year and month required (1-12)' }, { status: 400 })
  }

  const rows = await sql`
    SELECT b.id, b.year, b.month, b.description, b.amount_kr, b.created_at, u.display_name as created_by_name
    FROM billed_cases b
    LEFT JOIN users u ON u.id = b.created_by
    WHERE b.year = ${year} AND b.month = ${month}
    ORDER BY b.created_at ASC
  `
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { year, month, description, amount_kr } = body
  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json({ error: 'year and month required (1-12)' }, { status: 400 })
  }
  if (!description?.trim()) {
    return NextResponse.json({ error: 'description required' }, { status: 400 })
  }
  const amount = parseInt(amount_kr ?? '0', 10)
  if (isNaN(amount) || amount < 0) {
    return NextResponse.json({ error: 'amount_kr must be a non-negative number' }, { status: 400 })
  }

  const [row] = await sql`
    INSERT INTO billed_cases (year, month, description, amount_kr, created_by)
    VALUES (${year}, ${month}, ${description.trim()}, ${amount}, ${session.user.id})
    RETURNING id, year, month, description, amount_kr, created_at
  `
  const withUser = await sql`
    SELECT b.id, b.year, b.month, b.description, b.amount_kr, b.created_at, u.display_name as created_by_name
    FROM billed_cases b
    LEFT JOIN users u ON u.id = b.created_by
    WHERE b.id = ${row.id}
  `
  return NextResponse.json(withUser[0])
}
