import { useState } from 'react'
import { Link } from 'react-router-dom'
import { addVideo, deleteVideo } from '../api'
import './WatchlistSection.css'

export default function WatchlistSection({ categoryId, videos, onChange }) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    try {
      const video = await addVideo(categoryId, url.trim(), title.trim() || undefined)
      onChange(prev => [...prev, video])
      setUrl('')
      setTitle('')
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(videoId, e) {
    e.preventDefault()
    e.stopPropagation()
    await deleteVideo(videoId)
    onChange(prev => prev.filter(v => v.id !== videoId))
  }

  return (
    <div className="watchlist-section">
      {videos.length === 0 && <p className="empty-text">No videos yet.</p>}

      <div className="video-grid">
        {videos.map(v => (
          <Link key={v.id} to={`/categories/${categoryId}/watch/${v.id}`} className="video-card">
            <img src={v.thumbnailUrl} alt={v.title} className="thumbnail" />
            <div className="video-card-footer">
              <span className="video-title">{v.title}</span>
              <button
                onClick={e => handleDelete(v.id, e)}
                className="btn-danger small delete-btn"
                title="Remove from watchlist"
              >
                ✕
              </button>
            </div>
          </Link>
        ))}
      </div>

      <form onSubmit={handleAdd} className="add-form">
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="YouTube URL"
          className="text-input"
          required
        />
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="text-input"
        />
        <button type="submit" className="btn-primary">Add Video</button>
      </form>
      {error && <p className="error-msg">{error}</p>}
    </div>
  )
}
