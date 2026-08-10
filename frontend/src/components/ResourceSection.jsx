import { useState } from 'react'
import { addResource, deleteResource } from '../api'
import './ResourceSection.css'

export default function ResourceSection({ categoryId, resources, onChange }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [type, setType] = useState('url')
  const [error, setError] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    try {
      const resource = await addResource(categoryId, {
        title: title.trim(),
        url: url.trim(),
        resourceType: type,
      })
      onChange(prev => [...prev, resource])
      setTitle('')
      setUrl('')
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

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

      <form onSubmit={handleAdd} className="add-form">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          className="text-input"
          required
        />
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="URL or file path"
          className="text-input"
          required
        />
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="text-input resource-type-select"
        >
          <option value="url">URL</option>
          <option value="file">File</option>
        </select>
        <button type="submit" className="btn-primary">Add</button>
      </form>
      {error && <p className="error-msg">{error}</p>}
    </div>
  )
}
