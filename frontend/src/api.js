async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

// Categories
export const getCategories = () => request('/api/categories/')
export const createCategory = (name) =>
  request('/api/categories/', { method: 'POST', body: JSON.stringify({ name }) })
export const updateCategory = (id, name) =>
  request(`/api/categories/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) })
export const deleteCategory = (id) =>
  request(`/api/categories/${id}`, { method: 'DELETE' })

// Videos
export const getVideos = (categoryId) => request(`/api/categories/${categoryId}/videos`)
export const addVideo = (categoryId, url, title) =>
  request(`/api/categories/${categoryId}/videos`, {
    method: 'POST',
    body: JSON.stringify({ url, title }),
  })
export const deleteVideo = (id) => request(`/api/videos/${id}`, { method: 'DELETE' })

// Resources
export const getResources = (categoryId) => request(`/api/categories/${categoryId}/resources`)
export const addResource = (categoryId, data) =>
  request(`/api/categories/${categoryId}/resources`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const deleteResource = (id) => request(`/api/resources/${id}`, { method: 'DELETE' })

// Notes
export const getNotes = (categoryId) => request(`/api/categories/${categoryId}/notes`)
export const addNote = (categoryId, data) =>
  request(`/api/categories/${categoryId}/notes`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const updateNote = (id, data) =>
  request(`/api/notes/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteNote = (id) => request(`/api/notes/${id}`, { method: 'DELETE' })
