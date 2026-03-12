import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

const DEFAULT_GOAL_KR = 100000

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

  const [row] = await sql`
    SELECT goal_amount_kr FROM goals WHERE year = ${year} AND month = ${month}
  `
  const goal_amount_kr = row?.goal_amount_kr ?? DEFAULT_GOAL_KR
  return NextResponse.json({ goal_amount_kr })
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { year, month, goal_amount_kr } = body
  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json({ error: 'year and month required (1-12)' }, { status: 400 })
  }
  const amount = parseInt(goal_amount_kr ?? '', 10)
  if (isNaN(amount) || amount < 0) {
    return NextResponse.json({ error: 'goal_amount_kr must be a non-negative number' }, { status: 400 })
  }

  await sql`
    INSERT INTO goals (year, month, goal_amount_kr, updated_at)
    VALUES (${year}, ${month}, ${amount}, NOW())
    ON CONFLICT (year, month) DO UPDATE SET goal_amount_kr = ${amount}, updated_at = NOW()
  `
  return NextResponse.json({ goal_amount_kr: amount })
}
