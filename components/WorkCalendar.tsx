'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

type WorkLog = {
  id: string
  date: string
  hours: number
  note: string | null
  user_id: string
  display_name: string
}

function getMonthDates(year: number, month: number) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const start = new Date(first)
  start.setDate(start.getDate() - start.getDay() + (start.getDay() === 0 ? -6 : 1))
  const dates: Date[] = []
  const d = new Date(start)
  while (d <= last || d.getDay() !== 1) {
    dates.push(new Date(d))
    d.setDate(d.getDate() + 1)
    if (dates.length >= 42) break
  }
  return dates
}

function toDateString(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function WorkCalendar() {
  const { data: session } = useSession()
  const [current, setCurrent] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [logs, setLogs] = useState<Record<string, WorkLog[]>>({})
  const [editing, setEditing] = useState<string | null>(null)
  const [editHours, setEditHours] = useState('')
  const [editNote, setEditNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const fetchLogs = async () => {
    const start = new Date(current.year, current.month, 1)
    const end = new Date(current.year, current.month + 1, 0)
    const startStr = toDateString(start)
    const endStr = toDateString(end)

    const res = await fetch(`/api/work-logs?start=${startStr}&end=${endStr}`)
    if (res.ok) {
      const data = await res.json()
      const map: Record<string, WorkLog[]> = {}
      ;(Array.isArray(data) ? data : []).forEach((l: WorkLog) => {
        const dateKey = typeof l.date === 'string' ? l.date.slice(0, 10) : new Date(l.date).toISOString().slice(0, 10)
        if (!map[dateKey]) map[dateKey] = []
        map[dateKey].push({ ...l, date: dateKey })
      })
      setLogs(map)
    }
  }

  useEffect(() => {
    fetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.year, current.month])

  const dates = getMonthDates(current.year, current.month)
  const monthNames = [
    'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
    'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
  ]

  const prevMonth = () => {
    if (current.month === 0) {
      setCurrent({ year: current.year - 1, month: 11 })
    } else {
      setCurrent({ year: current.year, month: current.month - 1 })
    }
  }

  const nextMonth = () => {
    if (current.month === 11) {
      setCurrent({ year: current.year + 1, month: 0 })
    } else {
      setCurrent({ year: current.year, month: current.month + 1 })
    }
  }

  const openEdit = (dateStr: string) => {
    const dayLogs = logs[dateStr] || []
    const myLog = dayLogs.find((l) => l.user_id === (session?.user as { id?: string })?.id)
    setEditing(dateStr)
    setEditHours(myLog ? String(myLog.hours) : '')
    setEditNote(myLog?.note || '')
  }

  const closeEdit = () => {
    setEditing(null)
    setEditHours('')
    setEditNote('')
    setSaveError(null)
  }

  const saveLog = async () => {
    if (!editing) return

    setSaving(true)
    setSaveError(null)

    const hours = parseFloat(editHours) || 0

    const res = await fetch('/api/work-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: editing,
        hours,
        note: editNote.trim() || null,
      }),
    })

    setSaving(false)

    if (res.ok) {
      await fetchLogs()
      closeEdit()
    } else {
      setSaveError('Kunde inte spara. Försök igen.')
    }
  }

  const isCurrentMonth = (d: Date) =>
    d.getMonth() === current.month && d.getFullYear() === current.year

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">
          {monthNames[current.month]} {current.year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="px-3 py-1 border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Föregående
          </button>
          <button
            onClick={nextMonth}
            className="px-3 py-1 border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Nästa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-slate-600 mb-2">
        {['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dates.map((d) => {
          const dateStr = toDateString(d)
          const dayLogs = logs[dateStr] || []
          const isThisMonth = isCurrentMonth(d)
          const isToday =
            toDateString(new Date()) === dateStr

          return (
            <div
              key={dateStr}
              onClick={() => openEdit(dateStr)}
              className={`min-h-[90px] p-2 rounded-lg border cursor-pointer transition-colors ${
                isThisMonth
                  ? 'bg-white border-slate-200 hover:border-blue-300'
                  : 'bg-slate-50 border-slate-100 text-slate-400'
              } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
            >
              <div className="text-sm font-medium">{d.getDate()}</div>
              {dayLogs.map((log) => (log.hours > 0 || log.note) && (
                <div key={log.id} className="text-xs mt-1 text-left">
                  <span className="font-medium text-slate-700">{log.display_name}:</span>{' '}
                  {log.hours > 0 && (
                    <span className="text-blue-600">{log.hours}h</span>
                  )}
                  {log.note && (
                    <p className="truncate text-slate-500 mt-0.5" title={log.note}>
                      {log.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Work log list - visible log of all entries for the month */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Inloggade timmar – {monthNames[current.month]} {current.year}</h3>
        {(() => {
          const allLogs = Object.entries(logs)
            .filter(([dateStr]) => {
              const [y, m] = dateStr.split('-').map(Number)
              return m === current.month + 1 && y === current.year
            })
            .flatMap(([, dayLogs]) => dayLogs)
            .filter((l) => l.hours > 0 || l.note)
            .sort((a, b) => a.date.localeCompare(b.date))

          if (allLogs.length === 0) {
            return (
              <p className="text-slate-500 text-sm py-4 bg-white rounded-lg border border-slate-200 px-4">
                Inga timmar loggade denna månad. Klicka på en dag i kalendern för att logga.
              </p>
            )
          }

          return (
            <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
              {allLogs.map((log) => (
                <div key={log.id} className="px-4 py-3 flex flex-wrap items-start gap-x-4 gap-y-1">
                  <span className="font-medium text-slate-700 shrink-0">
                    {new Date(log.date + 'T12:00:00').toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span className="text-blue-600 font-medium shrink-0">{log.display_name}</span>
                  {log.hours > 0 && (
                    <span className="text-slate-600 shrink-0">{log.hours}h</span>
                  )}
                  {log.note && (
                    <span className="text-slate-600 flex-1 min-w-0">{log.note}</span>
                  )}
                </div>
              ))}
            </div>
          )
        })()}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-slate-800">
              Logga arbete – {new Date(editing + 'T12:00:00').toLocaleDateString('sv-SE', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h3>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Timmar</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={editHours}
                onChange={(e) => setEditHours(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Anteckning (vad du gjort)</label>
              <textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                rows={3}
                placeholder="Beskriv vad du har arbetat med..."
              />
            </div>
            {saveError && (
              <p className="text-sm text-red-600">{saveError}</p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={closeEdit}
                disabled={saving}
                className="px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                Avbryt
              </button>
              <button
                onClick={saveLog}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Sparar...' : 'Spara'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
