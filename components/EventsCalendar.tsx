'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DateTimePickerEvent } from '@/components/ui/date-time-picker-event'

type Event = {
  id: string
  title: string
  description: string | null
  start_at: string
  end_at: string
  created_at: string
  created_by_name?: string | null
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

/** Visar alltid starttiden (start_at), inte sluttiden. */
function formatStartTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
  })
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-foreground">
          {monthNames[current.month]} {current.year}
        </h2>
        <div className="flex gap-2">
          <Button onClick={() => openNewForm()}>Lägg till möte/händelse</Button>
          <Button variant="outline" size="sm" onClick={prevMonth}>
            Föregående
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            Nästa
          </Button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground">
        {['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dates.map((d) => {
          const dateStr = toDateString(d)
          const dayEvents = getEventsForDay(dateStr)
          const isThisMonth = isCurrentMonth(d)
          const isToday = toDateString(new Date()) === dateStr

          return (
            <Card
              key={dateStr}
              className={`min-h-[100px] p-2 ${
                isThisMonth
                  ? 'border-border bg-card'
                  : 'border-border/50 bg-muted/50 text-muted-foreground'
              } ${isToday ? 'ring-2 ring-primary' : ''}`}
            >
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{d.getDate()}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-primary"
                    onClick={() => openNewForm(dateStr)}
                  >
                    +
                  </Button>
                </div>
                <div className="mt-1 space-y-1">
                  {dayEvents.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => openEditForm(ev)}
                      className="block w-full truncate rounded bg-primary/10 px-2 py-1 text-left text-xs text-primary hover:bg-primary/20"
                      title={ev.created_by_name ? `${ev.title} (${ev.created_by_name})` : ev.title}
                    >
                      {formatStartTime(ev.start_at)}{' '}
                      {ev.title}
                      {ev.created_by_name && (
                        <span className="opacity-80"> · {ev.created_by_name}</span>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <Card
            className="w-full max-w-lg my-auto flex max-h-[90vh] flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
              <h3 className="font-semibold text-foreground shrink-0">
                {editingId ? 'Redigera händelse' : 'Lägg till händelse'}
              </h3>
              <div className="shrink-0">
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  Titel
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="T.ex. Möte med kund"
                />
              </div>
              <div className="shrink-0">
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  Beskrivning
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={2}
                />
              </div>
              <div className="min-h-0 shrink-0">
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Datum och tid
                </label>
                <DateTimePickerEvent
                  startAt={formStart}
                  endAt={formEnd}
                  onStartChange={setFormStart}
                  onEndChange={setFormEnd}
                />
              </div>
              <div className="flex shrink-0 justify-between gap-2 border-t border-border pt-4">
                <div>
                  {editingId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteEvent(editingId)}
                    >
                      Ta bort
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={closeForm}>
                    Avbryt
                  </Button>
                  <Button onClick={saveEvent}>Spara</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
