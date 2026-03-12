'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DatePickerDeadline } from '@/components/ui/date-picker-deadline'

type Task = {
  id: string
  description: string
  deadline: string | null
  is_done: boolean
  completion_note?: string | null
  created_at: string
  created_by_name?: string | null
}

const INPUT_STYLE =
  'w-full px-3.5 py-2.5 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-shadow'

export function ChecklistView() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<'todo' | 'done'>('todo')
  const [description, setDescription] = useState('')
  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [completingTask, setCompletingTask] = useState<Task | null>(null)
  const [completionNote, setCompletionNote] = useState('')

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks')
    if (res.ok) {
      const data = await res.json()
      setTasks(Array.isArray(data) ? data : [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const deadlineToString = (d: Date | undefined): string | null => {
    if (!d) return null
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    const deadline = deadlineToString(deadlineDate)

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: description.trim(), deadline }),
    })

    if (res.ok) {
      setDescription('')
      setDeadlineDate(undefined)
      fetchTasks()
    }
  }

  const openCompleteModal = (task: Task) => {
    setCompletingTask(task)
    setCompletionNote('')
  }

  const closeCompleteModal = () => {
    setCompletingTask(null)
    setCompletionNote('')
  }

  const handleConfirmComplete = async () => {
    if (!completingTask) return

    await fetch(`/api/tasks/${completingTask.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_done: true, completion_note: completionNote.trim() || null }),
    })
    fetchTasks()
    closeCompleteModal()
  }

  const handleToggleBack = async (task: Task) => {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_done: false, completion_note: null }),
    })
    fetchTasks()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    fetchTasks()
  }

  const filteredTasks = tasks.filter((t) => (view === 'todo' ? !t.is_done : t.is_done))

  const formatDate = (d: string | null | undefined) => {
    if (!d) return ''
    const dateStr = typeof d === 'string' ? d : String(d)
    const date = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T12:00:00')
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <div className="space-y-8">
      {/* Skapa uppgift */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleCreate} className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Skapa ny uppgift</h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Beskrivning
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${INPUT_STYLE} resize-none`}
                rows={2}
                placeholder="Vad ska göras?"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Deadline 2026
              </label>
              <DatePickerDeadline
                value={deadlineDate}
                onChange={setDeadlineDate}
                onClear={() => setDeadlineDate(undefined)}
              />
            </div>

            <Button type="submit">Lägg till uppgift</Button>
          </form>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        <Button
          variant={view === 'todo' ? 'secondary' : 'ghost'}
          size="sm"
          className={view === 'todo' ? 'shadow-sm' : ''}
          onClick={() => setView('todo')}
        >
          Att göra
        </Button>
        <Button
          variant={view === 'done' ? 'secondary' : 'ghost'}
          size="sm"
          className={view === 'done' ? 'shadow-sm' : ''}
          onClick={() => setView('done')}
        >
          Klara
        </Button>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Laddar...</p>
      ) : filteredTasks.length === 0 ? (
        <Card className="border-border shadow-sm">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            {view === 'todo' ? 'Inga uppgifter att göra.' : 'Inga slutförda uppgifter.'}
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-muted-foreground/30"
            >
              {view === 'todo' ? (
                <button
                  type="button"
                  onClick={() => openCompleteModal(task)}
                  className="mt-0.5 size-6 flex-shrink-0 rounded-md border-2 border-muted-foreground/40 flex items-center justify-center hover:border-primary hover:bg-accent"
                  title="Markera som klar"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => handleToggleBack(task)}
                  className="mt-0.5 size-6 flex-shrink-0 rounded-md border-2 border-green-500 bg-green-100 flex items-center justify-center hover:bg-green-200"
                  title="Återställ"
                >
                  <span className="text-sm font-bold text-green-700">✓</span>
                </button>
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={
                    task.is_done ? 'text-muted-foreground line-through' : 'text-foreground'
                  }
                >
                  {task.description}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
                  {task.deadline && formatDate(task.deadline) && (
                    <span>Deadline: {formatDate(task.deadline)}</span>
                  )}
                  {task.created_by_name && <span>· Av {task.created_by_name}</span>}
                  {task.is_done && task.completion_note && (
                    <span className="mt-1 block w-full text-foreground/80">
                      Anteckning: {task.completion_note}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(task.id)}
              >
                Ta bort
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Modal: Markera som klar */}
      {completingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card
            className="w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="space-y-5 p-6">
              <h3 className="text-lg font-semibold text-foreground">Markera som klar</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {completingTask.description}
              </p>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Anteckning (valfritt)
                </label>
                <textarea
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                  className={`${INPUT_STYLE} resize-none`}
                  rows={3}
                  placeholder="Vad gjorde du? Hur slutförde du uppgiften?"
                />
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <Button variant="outline" onClick={closeCompleteModal}>
                  Avbryt
                </Button>
                <Button onClick={handleConfirmComplete}>Bekräfta</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
