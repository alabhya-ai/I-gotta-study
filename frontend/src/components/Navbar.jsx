import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">I gotta study</Link>
      <div className="navbar-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/notes">Notes</NavLink>
        <NavLink to="/categories/manage">Manage Categories</NavLink>
      </div>
    </nav>
  )
}
