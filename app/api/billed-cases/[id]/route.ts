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
  const [existing] = await sql`
    SELECT description, amount_kr FROM billed_cases WHERE id = ${id}
  `
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const existingRow = existing as { description: string; amount_kr: number }
  const body = await request.json()
  const description = body.description !== undefined ? String(body.description).trim() : existingRow.description
  const amount_kr = body.amount_kr !== undefined ? parseInt(body.amount_kr ?? '0', 10) : existingRow.amount_kr
  if (isNaN(amount_kr) || amount_kr < 0) {
    return NextResponse.json({ error: 'amount_kr must be a non-negative number' }, { status: 400 })
  }

  await sql`
    UPDATE billed_cases SET description = ${description}, amount_kr = ${amount_kr} WHERE id = ${id}
  `

  const [row] = await sql`
    SELECT b.id, b.year, b.month, b.description, b.amount_kr, b.created_at, u.display_name as created_by_name
    FROM billed_cases b
    LEFT JOIN users u ON u.id = b.created_by
    WHERE b.id = ${id}
  `
  return NextResponse.json(row)
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
  const result = await sql`DELETE FROM billed_cases WHERE id = ${id} RETURNING id`
  if (result.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
