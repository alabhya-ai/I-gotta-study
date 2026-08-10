import { useState } from 'react'
import { addNote, updateNote, deleteNote } from '../api'
import './NotesSection.css'

export default function NotesSection({ categoryId, notes, videos, resources, onChange }) {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [linkedVideoId, setLinkedVideoId] = useState('')
  const [linkedResourceId, setLinkedResourceId] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [error, setError] = useState('')

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

  function handleVideoLink(e) {
    setLinkedVideoId(e.target.value)
    if (e.target.value) setLinkedResourceId('')
  }

  function handleResourceLink(e) {
    setLinkedResourceId(e.target.value)
    if (e.target.value) setLinkedVideoId('')
  }

  async function handleAdd(e) {
    e.preventDefault()
    try {
      const note = await addNote(categoryId, {
        content: content.trim(),
        title: title.trim() || undefined,
        linkedVideoId: linkedVideoId ? parseInt(linkedVideoId, 10) : undefined,
        linkedResourceId: linkedResourceId ? parseInt(linkedResourceId, 10) : undefined,
      })
      onChange(prev => [...prev, note])
      setContent('')
      setTitle('')
      setLinkedVideoId('')
      setLinkedResourceId('')
      setError('')
    } catch (err) {
      setError(err.message)
    }
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

      <form onSubmit={handleAdd} className="note-add-form">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="text-input"
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Note content"
          className="text-input note-textarea"
          rows={3}
          required
        />
        <div className="link-row">
          <span className="link-label">Link to:</span>
          <select value={linkedVideoId} onChange={handleVideoLink} className="text-input link-select">
            <option value="">No video</option>
            {videos.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
          </select>
          <select value={linkedResourceId} onChange={handleResourceLink} className="text-input link-select">
            <option value="">No resource</option>
            {resources.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-primary">Add Note</button>
      </form>
      {error && <p className="error-msg">{error}</p>}
    </div>
  )
}
