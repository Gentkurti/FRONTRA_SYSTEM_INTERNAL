import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { title, description, start_at, end_at } = body
  if (!title?.trim() || !start_at || !end_at) {
    return NextResponse.json({ error: 'title, start_at, end_at required' }, { status: 400 })
  }

  await sql`
    UPDATE events
    SET title = ${title.trim()}, description = ${description?.trim() || null}, start_at = ${start_at}, end_at = ${end_at}
    WHERE id = ${id}
  `
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await sql`DELETE FROM events WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
