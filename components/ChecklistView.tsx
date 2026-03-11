'use client'

import { useEffect, useState } from 'react'

type Task = {
  id: string
  description: string
  deadline: string | null
  is_done: boolean
  created_at: string
}

export function ChecklistView() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<'todo' | 'done'>('todo')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(true)

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: description.trim(), deadline: deadline || null }),
    })

    if (res.ok) {
      setDescription('')
      setDeadline('')
      fetchTasks()
    }
  }

  const handleToggle = async (task: Task) => {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_done: !task.is_done }),
    })
    fetchTasks()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    fetchTasks()
  }

  const filteredTasks = tasks.filter((t) =>
    view === 'todo' ? !t.is_done : t.is_done
  )

  const formatDate = (d: string | null) => {
    if (!d) return ''
    return new Date(d + 'T12:00:00').toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <h2 className="font-semibold text-slate-800">Skapa ny uppgift</h2>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Beskrivning</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="Beskriv uppgiften..."
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Lägg till
        </button>
      </form>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setView('todo')}
          className={`px-4 py-2 font-medium ${
            view === 'todo'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Att göra
        </button>
        <button
          onClick={() => setView('done')}
          className={`px-4 py-2 font-medium ${
            view === 'done'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Klara
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Laddar...</p>
      ) : filteredTasks.length === 0 ? (
        <p className="text-slate-500">
          {view === 'todo' ? 'Inga uppgifter att göra.' : 'Inga slutförda uppgifter.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              className="flex items-start gap-3 bg-white rounded-lg border border-slate-200 p-4"
            >
              <button
                onClick={() => handleToggle(task)}
                className="mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center hover:border-blue-500"
              >
                {task.is_done && (
                  <span className="text-blue-600 text-sm">✓</span>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={
                    task.is_done ? 'text-slate-500 line-through' : 'text-slate-800'
                  }
                >
                  {task.description}
                </p>
                {task.deadline && (
                  <p className="text-sm text-slate-500 mt-1">
                    Deadline: {formatDate(task.deadline)}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(task.id)}
                className="text-slate-400 hover:text-red-600 text-sm"
              >
                Ta bort
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
