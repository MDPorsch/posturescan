import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

function ShieldMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 4 L26 8 V16 C26 22.5 21.6 27.2 16 29 C10.4 27.2 6 22.5 6 16 V8 Z"
            fill="#10B981" />
      <path d="M11 16 L14.5 19.5 L21 13"
            stroke="#0B1219" strokeWidth="2.5" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const link = ({ isActive }) =>
  `text-sm font-medium tracking-tight transition ${
    isActive ? 'text-emerald-400' : 'text-emerald-50/70 hover:text-emerald-50'
  }`

export default function Navbar() {
  const { user, logout } = useAuth()
  const nav = useNavigate()

  const onLogout = () => { logout(); nav('/') }

  return (
    <header className="sticky top-0 z-20 border-b border-border-subtle/60 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <ShieldMark />
          <span className="font-display text-xl font-bold tracking-tight">PostureScan</span>
        </Link>

        <nav className="hidden items-center gap-7 sm:flex">
          <NavLink to="/" className={link} end>Scan</NavLink>
          <NavLink to="/dashboard" className={link}>Public dashboard</NavLink>
          {user && <NavLink to="/app" className={link}>My domains</NavLink>}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-emerald-50/60 sm:inline">
                {user.full_name || user.email}
              </span>
              <button onClick={onLogout} className="ps-btn-ghost px-3 py-1.5 text-sm">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="ps-link text-sm">Sign in</Link>
              <Link to="/register" className="ps-btn-primary px-3 py-1.5 text-sm">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
