import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCategories, getVideos, getResources, getNotes } from '../api'
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
        <summary className="section-title">Resources</summary>
        <div className="section-body">
          <ResourceSection
            categoryId={categoryId}
            resources={resources}
            onChange={setResources}
          />
        </div>
      </details>

      <details className="section" open>
        <summary className="section-title">Notes</summary>
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
        <summary className="section-title">Watchlist</summary>
        <div className="section-body">
          <WatchlistSection
            categoryId={categoryId}
            videos={videos}
            onChange={setVideos}
          />
        </div>
      </details>
    </div>
  )
}
