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
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json({ error: 'start and end required' }, { status: 400 })
  }

  const rows = await sql`
    SELECT id, date, hours, note
    FROM work_logs
    WHERE user_id = ${session.user.id}
      AND date >= ${start}
      AND date <= ${end}
  `
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { date, hours, note } = body
  if (!date) {
    return NextResponse.json({ error: 'date required' }, { status: 400 })
  }

  const h = parseFloat(String(hours)) || 0

  const [row] = await sql`
    INSERT INTO work_logs (user_id, date, hours, note)
    VALUES (${session.user.id}, ${date}, ${h}, ${note?.trim() || null})
    ON CONFLICT (user_id, date) DO UPDATE SET
      hours = EXCLUDED.hours,
      note = EXCLUDED.note
    RETURNING id, date, hours, note
  `
  return NextResponse.json(row)
}
