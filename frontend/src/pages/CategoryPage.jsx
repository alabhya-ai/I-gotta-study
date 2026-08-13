import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCategories, getVideos, getResources, getNotes, addResource, addNote, addVideo } from '../api'
import ResourceSection from '../components/ResourceSection'
import NotesSection from '../components/NotesSection'
import WatchlistSection from '../components/WatchlistSection'
import './CategoryPage.css'

export default function CategoryPage() {
  const { id } = useParams()
  const categoryId = parseInt(id, 10)

  const [category, setCategory] = useState(null)
  const [videos, setVideos] = useState([])
  const [resources, setResources] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const resourceDialogRef = useRef(null)
  const noteDialogRef = useRef(null)
  const videoDialogRef = useRef(null)

  const [resourceForm, setResourceForm] = useState({ title: '', url: '', type: 'url' })
  const [noteForm, setNoteForm] = useState({ content: '', videoId: '', resourceId: '' })
  const [videoForm, setVideoForm] = useState({ url: '', title: '' })
  const [addError, setAddError] = useState('')

  useEffect(() => {
    setLoading(true)
    setNotFound(false)

    Promise.all([
      getCategories(),
      getVideos(categoryId),
      getResources(categoryId),
      getNotes(categoryId),
    ]).then(([cats, vids, ress, ns]) => {
      const cat = cats.find(c => c.id === categoryId)
      if (!cat) { setNotFound(true); return }
      setCategory(cat)
      setVideos(vids)
      setResources(ress)
      setNotes(ns)
    }).finally(() => setLoading(false))
  }, [categoryId])

  async function handleAddResource(e) {
    e.preventDefault()
    try {
      const resource = await addResource(categoryId, {
        title: resourceForm.title.trim(),
        url: resourceForm.url.trim(),
        resourceType: resourceForm.type,
      })
      setResources(prev => [...prev, resource])
      setResourceForm({ title: '', url: '', type: 'url' })
      setAddError('')
      resourceDialogRef.current?.close()
    } catch (err) {
      setAddError(err.message)
    }
  }

  async function handleAddNote(e) {
    e.preventDefault()
    try {
      const note = await addNote(categoryId, {
        content: noteForm.content.trim(),
        videoId: noteForm.videoId ? parseInt(noteForm.videoId, 10) : null,
        resourceId: noteForm.resourceId ? parseInt(noteForm.resourceId, 10) : null,
      })
      setNotes(prev => [...prev, note])
      setNoteForm({ content: '', videoId: '', resourceId: '' })
      setAddError('')
      noteDialogRef.current?.close()
    } catch (err) {
      setAddError(err.message)
    }
  }

  async function handleAddVideo(e) {
    e.preventDefault()
    try {
      const video = await addVideo(categoryId, videoForm.url.trim(), videoForm.title.trim() || undefined)
      setVideos(prev => [...prev, video])
      setVideoForm({ url: '', title: '' })
      setAddError('')
      videoDialogRef.current?.close()
    } catch (err) {
      setAddError(err.message)
    }
  }

  if (loading) return <p className="muted">Loading…</p>

  if (notFound) {
    return (
      <div className="not-found">
        <p>Category not found.</p>
        <Link to="/">← Back to home</Link>
      </div>
    )
  }

  return (
    <div className="category-page">
      <h1 className="page-title">{category.name}</h1>

      <details className="section" open>
        <summary className="section-title">
          <span>Resources</span>
          <button onClick={(e) => { e.stopPropagation(); resourceDialogRef.current?.showModal() }} className="btn-add" title="Add resource">+</button>
        </summary>
        <div className="section-body">
          <ResourceSection
            categoryId={categoryId}
            resources={resources}
            onChange={setResources}
          />
        </div>
      </details>

      <details className="section" open>
        <summary className="section-title">
          <span>Notes</span>
          <button onClick={(e) => { e.stopPropagation(); noteDialogRef.current?.showModal() }} className="btn-add" title="Add note">+</button>
        </summary>
        <div className="section-body">
          <NotesSection
            categoryId={categoryId}
            notes={notes}
            videos={videos}
            resources={resources}
            onChange={setNotes}
          />
        </div>
      </details>

      <details className="section" open>
        <summary className="section-title">
          <span>Watchlist</span>
          <button onClick={(e) => { e.stopPropagation(); videoDialogRef.current?.showModal() }} className="btn-add" title="Add video">+</button>
        </summary>
        <div className="section-body">
          <WatchlistSection
            categoryId={categoryId}
            videos={videos}
            onChange={setVideos}
          />
        </div>
      </details>

      {/* Add Resource Dialog */}
      <dialog ref={resourceDialogRef} className="dialog">
        <div className="dialog-content">
          <h2>Add Resource</h2>
          <form onSubmit={handleAddResource} className="dialog-form">
            <input
              type="text"
              value={resourceForm.title}
              onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })}
              placeholder="Title"
              className="text-input"
              required
            />
            <input
              type="text"
              value={resourceForm.url}
              onChange={e => setResourceForm({ ...resourceForm, url: e.target.value })}
              placeholder="URL or file path"
              className="text-input"
              required
            />
            <select
              value={resourceForm.type}
              onChange={e => setResourceForm({ ...resourceForm, type: e.target.value })}
              className="text-input"
            >
              <option value="url">URL</option>
              <option value="file">File</option>
            </select>
            {addError && <p className="error-msg">{addError}</p>}
            <div className="dialog-buttons">
              <button type="submit" className="btn-primary">Add</button>
              <button type="button" onClick={(e) => { e.preventDefault(); setAddError(''); resourceDialogRef.current?.close() }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Add Note Dialog */}
      <dialog ref={noteDialogRef} className="dialog">
        <div className="dialog-content">
          <h2>Add Note</h2>
          <form onSubmit={handleAddNote} className="dialog-form">
            <textarea
              value={noteForm.content}
              onChange={e => setNoteForm({ ...noteForm, content: e.target.value })}
              placeholder="Note content"
              className="text-input textarea"
              required
            />
            <select
              value={noteForm.videoId}
              onChange={e => setNoteForm({ ...noteForm, videoId: e.target.value })}
              className="text-input"
            >
              <option value="">No video</option>
              {videos.map(v => (
                <option key={v.id} value={v.id}>{v.title}</option>
              ))}
            </select>
            <select
              value={noteForm.resourceId}
              onChange={e => setNoteForm({ ...noteForm, resourceId: e.target.value })}
              className="text-input"
            >
              <option value="">No resource</option>
              {resources.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
            {addError && <p className="error-msg">{addError}</p>}
            <div className="dialog-buttons">
              <button type="submit" className="btn-primary">Add</button>
              <button type="button" onClick={(e) => { e.preventDefault(); setAddError(''); noteDialogRef.current?.close() }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Add Video Dialog */}
      <dialog ref={videoDialogRef} className="dialog">
        <div className="dialog-content">
          <h2>Add Video</h2>
          <form onSubmit={handleAddVideo} className="dialog-form">
            <input
              type="text"
              value={videoForm.url}
              onChange={e => setVideoForm({ ...videoForm, url: e.target.value })}
              placeholder="YouTube URL or playlist URL"
              className="text-input"
              required
            />
            <input
              type="text"
              value={videoForm.title}
              onChange={e => setVideoForm({ ...videoForm, title: e.target.value })}
              placeholder="Title (optional)"
              className="text-input"
            />
            {addError && <p className="error-msg">{addError}</p>}
            <div className="dialog-buttons">
              <button type="submit" className="btn-primary">Add</button>
              <button type="button" onClick={(e) => { e.preventDefault(); setAddError(''); videoDialogRef.current?.close() }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  )
}
