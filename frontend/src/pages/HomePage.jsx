import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories } from '../api'
import './HomePage.css'

export default function HomePage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories().then(setCategories).finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="muted">Loading…</p>

  if (categories.length === 0) {
    return (
      <div className="not-found">
        <p>No categories yet.</p>
        <Link to="/categories/manage">Go to Manage Categories to add one →</Link>
      </div>
    )
  }

  return (
    <div className="home-page">
      <h1 className="page-title">Categories</h1>
      <div className="category-grid">
        {categories.map(cat => (
          <Link key={cat.id} to={`/categories/${cat.id}`} className="category-card">
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
