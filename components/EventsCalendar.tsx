'use client'

import { useEffect, useState } from 'react'

type Event = {
  id: string
  title: string
  description: string | null
  start_at: string
  end_at: string
  created_at: string
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

function isSameDay(a: string, b: string) {
  return a.slice(0, 10) === b.slice(0, 10)
}

export function EventsCalendar() {
  const [current, setCurrent] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [events, setEvents] = useState<Event[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formStart, setFormStart] = useState('')
  const [formEnd, setFormEnd] = useState('')

  const fetchEvents = async () => {
    const monthStart = new Date(current.year, current.month, 1)
    const monthEnd = new Date(current.year, current.month + 1, 0, 23, 59, 59)
    const startStr = monthStart.toISOString()
    const endStr = monthEnd.toISOString()

    const res = await fetch(`/api/events?start=${encodeURIComponent(startStr)}&end=${encodeURIComponent(endStr)}`)
    if (res.ok) {
      const data = await res.json()
      setEvents(Array.isArray(data) ? data : [])
    }
  }

  useEffect(() => {
    fetchEvents()
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

  const openNewForm = (dateStr?: string) => {
    setEditingId(null)
    const d = dateStr ? new Date(dateStr + 'T09:00:00') : new Date()
    const start = d.toISOString().slice(0, 16)
    const end = new Date(d.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16)
    setFormTitle('')
    setFormDesc('')
    setFormStart(start)
    setFormEnd(end)
    setShowForm(true)
  }

  const openEditForm = (e: Event) => {
    setEditingId(e.id)
    setFormTitle(e.title)
    setFormDesc(e.description || '')
    setFormStart(e.start_at.slice(0, 16))
    setFormEnd(e.end_at.slice(0, 16))
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const saveEvent = async () => {
    if (!formTitle.trim()) return

    if (editingId) {
      await fetch(`/api/events/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDesc.trim() || null,
          start_at: formStart,
          end_at: formEnd,
        }),
      })
    } else {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDesc.trim() || null,
          start_at: formStart,
          end_at: formEnd,
        }),
      })
    }
    fetchEvents()
    closeForm()
  }

  const deleteEvent = async (id: string) => {
    await fetch(`/api/events/${id}`, { method: 'DELETE' })
    fetchEvents()
    closeForm()
  }

  const getEventsForDay = (dateStr: string) =>
    events.filter((e) => isSameDay(e.start_at, dateStr) || isSameDay(e.end_at, dateStr))

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
            onClick={() => openNewForm()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Lägg till möte/händelse
          </button>
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
          const dayEvents = getEventsForDay(dateStr)
          const isThisMonth = isCurrentMonth(d)
          const isToday = toDateString(new Date()) === dateStr

          return (
            <div
              key={dateStr}
              className={`min-h-[100px] p-2 rounded-lg border ${
                isThisMonth
                  ? 'bg-white border-slate-200'
                  : 'bg-slate-50 border-slate-100 text-slate-400'
              } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{d.getDate()}</span>
                <button
                  onClick={() => openNewForm(dateStr)}
                  className="text-slate-400 hover:text-blue-600 text-xs"
                >
                  +
                </button>
              </div>
              <div className="mt-1 space-y-1">
                {dayEvents.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => openEditForm(ev)}
                    className="block w-full text-left text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 truncate hover:bg-blue-200"
                    title={ev.title}
                  >
                    {new Date(ev.start_at).toLocaleTimeString('sv-SE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    {ev.title}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-slate-800">
              {editingId ? 'Redigera händelse' : 'Lägg till händelse'}
            </h3>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Titel</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                placeholder="T.ex. Möte med kund"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Beskrivning</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Start</label>
                <input
                  type="datetime-local"
                  value={formStart}
                  onChange={(e) => setFormStart(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Slut</label>
                <input
                  type="datetime-local"
                  value={formEnd}
                  onChange={(e) => setFormEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-between">
              <div>
                {editingId && (
                  <button
                    onClick={() => deleteEvent(editingId)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Ta bort
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={closeForm}
                  className="px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50"
                >
                  Avbryt
                </button>
                <button
                  onClick={saveEvent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Spara
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
