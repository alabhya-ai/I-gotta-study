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
            {r.resourceType === 'url' ? (
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                {r.title}
              </a>
            ) : (
              <>
                <span className="resource-link resource-title">{r.title}</span>
                <button
                  type="button"
                  className="btn-ghost small resource-path-button"
                  command="show-modal"
                  commandfor={`local-file-dialog-${r.id}`}
                >
                  View path
                </button>
                <dialog
                  id={`local-file-dialog-${r.id}`}
                  className="resource-dialog"
                  aria-labelledby={`local-file-title-${r.id}`}
                >
                  <h3 id={`local-file-title-${r.id}`} className="resource-dialog-title">{r.title}</h3>
                  <p className="muted">Copy this path to open the file on your computer.</p>
                  <p className="resource-file-path">{r.url}</p>
                  <div className="resource-dialog-actions">
                    <button type="button" className="btn-primary" commandfor={`local-file-dialog-${r.id}`} command="close">
                      Close
                    </button>
                  </div>
                </dialog>
              </>
            )}
            <button onClick={() => handleDelete(r.id)} className="btn-danger small">✕</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
