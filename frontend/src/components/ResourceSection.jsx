import { deleteResource } from '../api'
import './ResourceSection.css'

export default function ResourceSection({ categoryId, resources, onChange }) {
  async function handleDelete(id) {
    await deleteResource(id)
    onChange(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="resource-section">
      {resources.length === 0 && <p className="empty-text">No resources yet.</p>}

      <ul className="resource-list">
        {resources.map(r => (
          <li key={r.id} className="resource-row">
            <span className={`badge badge-${r.resourceType}`}>{r.resourceType}</span>
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="resource-link">
              {r.title}
            </a>
            <button onClick={() => handleDelete(r.id)} className="btn-danger small">✕</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
