import { useEffect, useMemo, useState } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all') // all | pending | completed
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')

  async function api(path, options) {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data?.error || `Request failed (${res.status})`)
    }
    return data
  }

  async function loadTasks() {
    setLoading(true)
    setError('')
    try {
      // Always fetch all tasks and filter locally so the UI never "loses" completed tasks
      // due to query params or proxy caching quirks.
      const data = await api(`/api/tasks`)
      setTasks(data)
    } catch (e) {
      setError(e.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = useMemo(() => {
    const pending = tasks.filter((t) => t.status === 'pending').length
    const completed = tasks.filter((t) => t.status === 'completed').length
    return { pending, completed, total: tasks.length }
  }, [tasks])

  const visibleTasks = useMemo(() => {
    if (filter === 'pending') return tasks.filter((t) => t.status === 'pending')
    if (filter === 'completed') return tasks.filter((t) => t.status === 'completed')
    return tasks
  }, [tasks, filter])

  async function createTask(e) {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    setError('')
    try {
      const created = await api('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title }),
      })
      setNewTitle('')
      setTasks((prev) => [created, ...prev])
    } catch (e2) {
      setError(e2.message || 'Failed to create task')
    }
  }

  async function toggleStatus(task) {
    const next = task.status === 'pending' ? 'completed' : 'pending'
    setError('')
    try {
      const updated = await api(`/api/tasks/${task._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      })
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
    } catch (e2) {
      setError(e2.message || 'Failed to update status')
    }
  }

  function startEdit(task) {
    setEditingId(task._id)
    setEditingTitle(task.title)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingTitle('')
  }

  async function saveEdit(task) {
    const title = editingTitle.trim()
    if (!title) return
    setError('')
    try {
      const updated = await api(`/api/tasks/${task._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title }),
      })
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
      cancelEdit()
    } catch (e2) {
      setError(e2.message || 'Failed to update title')
    }
  }

  async function deleteTask(task) {
    setError('')
    try {
      await api(`/api/tasks/${task._id}`, { method: 'DELETE' })
      if (editingId === task._id) cancelEdit()
      await loadTasks()
    } catch (e2) {
      setError(e2.message || 'Failed to delete task')
    }
  }

  return (
    <div className="page">
      <div className="header">
        <div>
          <h1>Tasks CRUD</h1>
          <div className="muted">
            Total: {stats.total} · Pending: {stats.pending} · Completed: {stats.completed}
          </div>
        </div>
        <div className="row">
          <label className="muted" htmlFor="filter">
            Filter
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="card">
        <form className="row" onSubmit={createTask}>
          <input
            type="text"
            value={newTitle}
            placeholder="Add a task title…"
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button className="primary" type="submit">
            Add
          </button>
          <button type="button" onClick={loadTasks} disabled={loading}>
            Refresh
          </button>
        </form>
        {error ? <div style={{ marginTop: 10, color: '#fca5a5' }}>{error}</div> : null}
        {loading ? <div className="muted" style={{ marginTop: 10 }}>Loading…</div> : null}
      </div>

      <div className="list">
        {visibleTasks.length === 0 && !loading ? (
          <div className="muted">No tasks yet.</div>
        ) : null}

        {visibleTasks.map((t) => (
          <div className="task" key={t._id}>
            <div>
              {editingId === t._id ? (
                <div className="row">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                  />
                  <button className="primary" type="button" onClick={() => saveEdit(t)}>
                    Save
                  </button>
                  <button type="button" onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div className="taskTitle">{t.title}</div>
                  <span className={`badge ${t.status}`}>{t.status}</span>
                </div>
              )}
            </div>

            <div className="actions">
              <button type="button" onClick={() => toggleStatus(t)}>
                {t.status === 'pending' ? 'Mark completed' : 'Mark pending'}
              </button>
              <button type="button" onClick={() => startEdit(t)} disabled={editingId === t._id}>
                Edit
              </button>
              <button className="danger" type="button" onClick={() => deleteTask(t)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
