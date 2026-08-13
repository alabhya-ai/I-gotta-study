import { Link } from 'react-router-dom'
import { deleteVideo } from '../api'
import './WatchlistSection.css'

export default function WatchlistSection({ categoryId, videos, onChange }) {
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
    </div>
  )
}
