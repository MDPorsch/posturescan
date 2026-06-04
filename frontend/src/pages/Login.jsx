import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Login() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      nav('/app')
    } catch (err) {
      setError(err.data?.detail || err.message || 'Login failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-3xl font-bold tracking-tight">Welcome back.</h1>
      <p className="mt-2 text-emerald-50/70">Sign in to track domains and view history.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          type="email" autoComplete="email" required
          className="ps-input" placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password" autoComplete="current-password" required
          className="ps-input" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="font-mono text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={busy} className="ps-btn-primary w-full disabled:opacity-60">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-emerald-50/60">
        No account? <Link to="/register" className="ps-link">Create one</Link>.
      </p>
    </div>
  )
}
