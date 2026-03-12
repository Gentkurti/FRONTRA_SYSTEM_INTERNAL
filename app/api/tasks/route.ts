import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await sql`
    SELECT t.id, t.description, t.deadline, t.is_done, t.completion_note, t.created_by, t.created_at, u.display_name as created_by_name
    FROM tasks t
    LEFT JOIN users u ON u.id = t.created_by
    ORDER BY t.created_at DESC
  `
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { description, deadline } = body
  if (!description?.trim()) {
    return NextResponse.json({ error: 'Beskrivning krävs' }, { status: 400 })
  }

  const [row] = await sql`
    INSERT INTO tasks (description, deadline, is_done, created_by)
    VALUES (${description.trim()}, ${deadline || null}, false, ${session.user.id})
    RETURNING id, description, deadline, is_done, created_at
  `
  return NextResponse.json(row)
}
