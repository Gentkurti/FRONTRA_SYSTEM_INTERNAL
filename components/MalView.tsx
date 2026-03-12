'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const MONTHS = [
  'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
  'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
]

type BilledCase = {
  id: string
  year: number
  month: number
  description: string
  amount_kr: number
  created_at: string
  created_by_name?: string | null
}

const YEAR = 2026

export function MalView() {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [goalKr, setGoalKr] = useState(100000)
  const [cases, setCases] = useState<BilledCase[]>([])
  const [loading, setLoading] = useState(true)
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState('100000')
  const [newDesc, setNewDesc] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDesc, setEditDesc] = useState('')
  const [editAmount, setEditAmount] = useState('')

  const totalKr = cases.reduce((s, c) => s + c.amount_kr, 0)
  const progress = goalKr > 0 ? Math.min(totalKr / goalKr, 1) : 0
  const isGoalReached = totalKr >= goalKr

  const refetchCases = async () => {
    const res = await fetch(`/api/billed-cases?year=${YEAR}&month=${month}`)
    if (res.ok) {
      const data = await res.json()
      setCases(Array.isArray(data) ? data : [])
    }
  }

  useEffect(() => {
    setLoading(true)
    const run = async () => {
      const [goalRes, casesRes] = await Promise.all([
        fetch(`/api/goals?year=${YEAR}&month=${month}`),
        fetch(`/api/billed-cases?year=${YEAR}&month=${month}`),
      ])
      if (goalRes.ok) {
        const data = await goalRes.json()
        setGoalKr(data.goal_amount_kr ?? 100000)
        setGoalInput(String(data.goal_amount_kr ?? 100000))
      }
      if (casesRes.ok) {
        const data = await casesRes.json()
        setCases(Array.isArray(data) ? data : [])
      }
      setLoading(false)
    }
    run()
  }, [month])

  const saveGoal = async () => {
    const val = parseInt(goalInput.replace(/\s/g, ''), 10)
    if (isNaN(val) || val < 0) return
    const res = await fetch('/api/goals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: YEAR, month, goal_amount_kr: val }),
    })
    if (res.ok) {
      setGoalKr(val)
      setEditingGoal(false)
    }
  }

  const addCase = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDesc.trim()) return
    const amount = parseInt(newAmount.replace(/\s/g, ''), 10) || 0
    const res = await fetch('/api/billed-cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: YEAR, month, description: newDesc.trim(), amount_kr: amount }),
    })
    if (res.ok) {
      setNewDesc('')
      setNewAmount('')
      refetchCases()
    }
  }

  const startEdit = (c: BilledCase) => {
    setEditingId(c.id)
    setEditDesc(c.description)
    setEditAmount(String(c.amount_kr))
  }

  const saveEdit = async () => {
    if (!editingId) return
    const amount = parseInt(editAmount.replace(/\s/g, ''), 10) || 0
    await fetch(`/api/billed-cases/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: editDesc.trim(), amount_kr: amount }),
    })
    setEditingId(null)
    refetchCases()
  }

  const deleteCase = async (id: string) => {
    await fetch(`/api/billed-cases/${id}`, { method: 'DELETE' })
    refetchCases()
  }

  const prevMonth = () => setMonth((m) => (m <= 1 ? 12 : m - 1))
  const nextMonth = () => setMonth((m) => (m >= 12 ? 1 : m + 1))

  if (loading) {
    return <p className="text-muted-foreground text-sm">Laddar...</p>
  }

  return (
    <div className="space-y-8">
      {/* Månadsnav */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="sm" onClick={prevMonth}>
          Föregående
        </Button>
        <span className="text-lg font-medium text-foreground min-w-[140px] text-center">
          {MONTHS[month - 1]} {YEAR}
        </span>
        <Button variant="outline" size="sm" onClick={nextMonth}>
          Nästa
        </Button>
      </div>

      {/* Mynt – progress */}
      <div className="flex justify-center">
        <div
          className="relative flex items-center justify-center rounded-full w-64 h-64 sm:w-72 sm:h-72 border-4 border-slate-300 bg-slate-200 shadow-lg overflow-hidden"
          style={{
            background: isGoalReached
              ? 'radial-gradient(circle at 30% 30%, #fef3c7, #d97706)'
              : undefined,
          }}
        >
          {!isGoalReached && (
            <div
              className="absolute inset-0 opacity-90"
              style={{
                background: `conic-gradient(from 0deg, rgb(59 130 246) 0deg, rgb(59 130 246) ${progress * 360}deg, transparent ${progress * 360}deg)`,
              }}
            />
          )}
          <span
            className={`relative z-10 text-6xl sm:text-7xl font-bold select-none ${
              isGoalReached ? 'text-white drop-shadow' : 'text-slate-700'
            }`}
          >
            $
          </span>
        </div>
      </div>

      {/* Målbelopp + total */}
      <div className="text-center space-y-1">
        <p className="text-muted-foreground text-sm">
          {totalKr.toLocaleString('sv-SE')} kr /{' '}
          {editingGoal ? (
            <span className="inline-flex items-center gap-1">
              <input
                type="text"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                className="w-24 rounded border border-input bg-card px-2 py-0.5 text-foreground text-sm"
              />
              <Button size="sm" onClick={saveGoal}>
                Spara
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditingGoal(false); setGoalInput(String(goalKr)) }}>
                Avbryt
              </Button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setEditingGoal(true)}
              className="text-foreground font-medium underline underline-offset-2 hover:no-underline"
            >
              {goalKr.toLocaleString('sv-SE')} kr
            </button>
          )}{' '}
          mål
        </p>
        <p className="text-sm font-medium text-foreground">
          {progress >= 1 ? 'Målet nått!' : `${Math.round(progress * 100)}% av målet`}
        </p>
      </div>

      {/* Lista fakturerade case + formulär */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Fakturerade case</h2>

          <form onSubmit={addCase} className="flex flex-wrap gap-2">
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Beskrivning"
              className="flex-1 min-w-[120px] rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="text"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="Belopp (kr)"
              className="w-24 rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" size="sm">
              Lägg till
            </Button>
          </form>

          <ul className="space-y-2">
            {cases.length === 0 ? (
              <li className="text-sm text-muted-foreground">Inga case ännu denna månad.</li>
            ) : (
              cases.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                >
                  {editingId === c.id ? (
                    <>
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="flex-1 min-w-0 rounded border border-input bg-card px-2 py-1"
                      />
                      <input
                        type="text"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-20 rounded border border-input bg-card px-2 py-1"
                      />
                      <Button size="sm" onClick={saveEdit}>
                        Spara
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Avbryt
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 min-w-0 truncate">
                        {c.description} {c.created_by_name && <span className="text-muted-foreground">· {c.created_by_name}</span>}
                      </span>
                      <span className="font-medium">{c.amount_kr.toLocaleString('sv-SE')} kr</span>
                      <Button size="sm" variant="ghost" className="shrink-0" onClick={() => startEdit(c)}>
                        Redigera
                      </Button>
                      <Button size="sm" variant="ghost" className="shrink-0 text-destructive hover:text-destructive" onClick={() => deleteCase(c.id)}>
                        Ta bort
                      </Button>
                    </>
                  )}
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
