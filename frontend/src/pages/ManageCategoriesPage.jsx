import { useEffect, useState } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api'
import './ManageCategoriesPage.css'

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    try {
      const cat = await createCategory(name)
      setCategories(prev => [...prev, cat])
      setNewName('')
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleRename(id) {
    const name = editName.trim()
    if (!name) return
    try {
      const updated = await updateCategory(id, name)
      setCategories(prev => prev.map(c => c.id === id ? updated : c))
      setEditingId(null)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category and all its videos, resources, and notes?')) return
    await deleteCategory(id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  function startEdit(cat) {
    setEditingId(cat.id)
    setEditName(cat.name)
  }

  return (
    <div className="manage-page">
      <h1 className="page-title">Manage Categories</h1>

      <form onSubmit={handleAdd} className="add-form">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New category name"
          className="text-input"
          required
        />
        <button type="submit" className="btn-primary">Add Category</button>
      </form>
      {error && <p className="error-msg">{error}</p>}

      {categories.length === 0 && (
        <p className="empty-text" style={{ marginTop: '24px' }}>No categories yet. Add one above.</p>
      )}

      <ul className="category-manage-list">
        {categories.map(cat => (
          <li key={cat.id} className="category-manage-row">
            {editingId === cat.id ? (
              <>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="text-input"
                  autoFocus
                  onKeyDown={e => e.key === 'Escape' && setEditingId(null)}
                />
                <button onClick={() => handleRename(cat.id)} className="btn-primary">Save</button>
                <button onClick={() => setEditingId(null)} className="btn-ghost">Cancel</button>
              </>
            ) : (
              <>
                <span className="manage-cat-name">{cat.name}</span>
                <button onClick={() => startEdit(cat)} className="btn-ghost">Rename</button>
                <button onClick={() => handleDelete(cat.id)} className="btn-danger">Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
