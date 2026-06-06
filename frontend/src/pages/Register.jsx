import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import PasswordInput from '../components/PasswordInput.jsx'

export default function Register() {
  const nav = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await register(form)
      nav('/app')
    } catch (err) {
      const data = err.data
      const message = data
        ? Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' · ')
        : err.message
      setError(message || 'Could not create account.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-3xl font-bold tracking-tight">Start tracking.</h1>
      <p className="mt-2 text-emerald-50/70">Free account. No card. Just an email.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input className="ps-input" placeholder="Full name (optional)"
               value={form.full_name} onChange={update('full_name')} />
        <input type="email" required autoComplete="email"
               className="ps-input" placeholder="you@example.com"
               value={form.email} onChange={update('email')} />
        <PasswordInput
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Password (8+ characters)"
          value={form.password}
          onChange={update('password')}
        />
        {error && <p className="font-mono text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={busy} className="ps-btn-primary w-full disabled:opacity-60">
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-emerald-50/60">
        Already have one? <Link to="/login" className="ps-link">Sign in</Link>.
      </p>
    </div>
  )
}
