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
    SELECT e.id, e.title, e.description, e.start_at, e.end_at, e.created_at, u.display_name as created_by_name
    FROM events e
    LEFT JOIN users u ON u.id = e.created_by
    WHERE e.start_at <= ${end}
      AND e.end_at >= ${start}
    ORDER BY e.start_at ASC
  `
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, start_at, end_at } = body
  if (!title?.trim() || !start_at || !end_at) {
    return NextResponse.json({ error: 'title, start_at, end_at required' }, { status: 400 })
  }

  const [row] = await sql`
    INSERT INTO events (title, description, start_at, end_at, created_by)
    VALUES (${title.trim()}, ${description?.trim() || null}, ${start_at}, ${end_at}, ${session.user.id})
    RETURNING id, title, description, start_at, end_at, created_at
  `
  return NextResponse.json(row)
}
