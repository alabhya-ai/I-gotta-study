import { useState } from 'react'
import { updateNote, deleteNote } from '../api'
import './NotesSection.css'

export default function NotesSection({ categoryId, notes, videos, resources, onChange }) {
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')

  function getLinkedLabel(note) {
    if (note.linkedVideoId) {
      const v = videos.find(v => v.id === note.linkedVideoId)
      return v ? `Video: ${v.title}` : 'Linked video (deleted)'
    }
    if (note.linkedResourceId) {
      const r = resources.find(r => r.id === note.linkedResourceId)
      return r ? `Resource: ${r.title}` : 'Linked resource (deleted)'
    }
    return null
  }

  async function handleSaveEdit(id) {
    const updated = await updateNote(id, {
      content: editContent.trim(),
      title: editTitle.trim() || undefined,
    })
    onChange(prev => prev.map(n => n.id === id ? updated : n))
    setEditingId(null)
  }

  async function handleDelete(id) {
    await deleteNote(id)
    onChange(prev => prev.filter(n => n.id !== id))
  }

  function startEdit(note) {
    setEditingId(note.id)
    setEditContent(note.content)
    setEditTitle(note.title || '')
  }

  return (
    <div className="notes-section">
      {notes.length === 0 && <p className="empty-text">No notes yet.</p>}

      <div className="note-list">
        {notes.map(note => {
          const linkedLabel = getLinkedLabel(note)
          return (
            <div key={note.id} className="note-card">
              {editingId === note.id ? (
                <div className="note-edit">
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="Title (optional)"
                    className="text-input"
                  />
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="text-input note-textarea"
                    rows={4}
                    autoFocus
                  />
                  <div className="note-edit-actions">
                    <button onClick={() => handleSaveEdit(note.id)} className="btn-primary">Save</button>
                    <button onClick={() => setEditingId(null)} className="btn-ghost">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  {note.title && <p className="note-title">{note.title}</p>}
                  <p className="note-content">{note.content}</p>
                  {linkedLabel && <p className="note-link-label">↳ {linkedLabel}</p>}
                  <div className="note-actions">
                    <button onClick={() => startEdit(note)} className="btn-ghost small">Edit</button>
                    <button onClick={() => handleDelete(note.id)} className="btn-danger small">Delete</button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}
