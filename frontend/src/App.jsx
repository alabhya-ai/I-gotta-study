import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import WatchPage from './pages/WatchPage'
import ManageCategoriesPage from './pages/ManageCategoriesPage'
import NotesPage from './pages/NotesPage'

export default function App() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories/manage" element={<ManageCategoriesPage />} />
          <Route path="/categories/:id" element={<CategoryPage />} />
          <Route path="/categories/:id/watch/:videoId" element={<WatchPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}
