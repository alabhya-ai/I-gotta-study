import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCategories, getVideos, getNotes, addNote, deleteNote } from '../api'
import VideoPlayer from '../components/VideoPlayer'
import './WatchPage.css'

export default function WatchPage() {
  const { id, videoId } = useParams()
  const categoryId = parseInt(id, 10)
  const vidId = parseInt(videoId, 10)

  const [video, setVideo] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [linkedNotes, setLinkedNotes] = useState([])
  const [noteContent, setNoteContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    Promise.all([
      getCategories(),
      getVideos(categoryId),
      getNotes(categoryId),
    ]).then(([cats, videos, notes]) => {
      const cat = cats.find(c => c.id === categoryId)
      const vid = videos.find(v => v.id === vidId)
      if (!vid) { setNotFound(true); return }
      setCategoryName(cat?.name || '')
      setVideo(vid)
      setLinkedNotes(notes.filter(n => n.linkedVideoId === vidId))
    }).finally(() => setLoading(false))
  }, [categoryId, vidId])

  async function handleAddNote(e) {
    e.preventDefault()
    const content = noteContent.trim()
    if (!content) return
    const note = await addNote(categoryId, { content, linkedVideoId: vidId })
    setLinkedNotes(prev => [...prev, note])
    setNoteContent('')
  }

  async function handleDeleteNote(noteId) {
    await deleteNote(noteId)
    setLinkedNotes(prev => prev.filter(n => n.id !== noteId))
  }

  if (loading) return <p className="muted">Loading…</p>

  if (notFound) {
    return (
      <div className="not-found">
        <p>Video not found.</p>
        <Link to={`/categories/${categoryId}`}>← Back to category</Link>
      </div>
    )
  }

  return (
    <div className="watch-page">
      <Link to={`/categories/${categoryId}`} className="back-link">
        ← {categoryName || 'Back'}
      </Link>

      <h1 className="watch-title">{video.title}</h1>

      <VideoPlayer youtubeId={video.youtubeId} />

      <section className="watch-notes">
        <h2 className="watch-notes-title">Notes for this video</h2>

        {linkedNotes.length === 0 && <p className="empty-text">No notes yet.</p>}

        <div className="watch-note-list">
          {linkedNotes.map(note => (
            <div key={note.id} className="note-card">
              {note.title && <p className="note-title">{note.title}</p>}
              <p className="note-content">{note.content}</p>
              <div className="note-actions">
                <button onClick={() => handleDeleteNote(note.id)} className="btn-danger small">Delete</button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddNote} className="watch-note-form">
          <textarea
            value={noteContent}
            onChange={e => setNoteContent(e.target.value)}
            placeholder="Add a note for this video…"
            className="text-input note-textarea"
            rows={3}
          />
          <button type="submit" className="btn-primary">Add Note</button>
        </form>
      </section>
    </div>
  )
}
