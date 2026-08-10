import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories, getNotes } from '../api'
import './NotesPage.css'

export default function NotesPage() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories().then(async cats => {
      const results = await Promise.all(
        cats.map(cat => getNotes(cat.id).then(notes => ({ category: cat, notes })))
      )
      setGroups(results.filter(g => g.notes.length > 0))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="muted">Loading…</p>

  if (groups.length === 0) {
    return (
      <div className="notes-page">
        <h1 className="page-title">Notes</h1>
        <p className="empty-text">No notes yet. Add notes from a category page.</p>
      </div>
    )
  }

  return (
    <div className="notes-page">
      <h1 className="page-title">Notes</h1>
      {groups.map(({ category, notes }) => (
        <section key={category.id} className="notes-group">
          <h2 className="notes-group-title">
            <Link to={`/categories/${category.id}`}>{category.name}</Link>
          </h2>
          <div className="notes-group-list">
            {notes.map(note => (
              <div key={note.id} className="note-card">
                {note.title && <p className="note-title">{note.title}</p>}
                <p className="note-content">{note.content}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
