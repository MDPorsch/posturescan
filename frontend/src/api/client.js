const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const ACCESS_KEY = 'ps.access'
const REFRESH_KEY = 'ps.refresh'

export const tokens = {
  get access()  { return localStorage.getItem(ACCESS_KEY) },
  get refresh() { return localStorage.getItem(REFRESH_KEY) },
  set(access, refresh) {
    if (access)  localStorage.setItem(ACCESS_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

async function refresh() {
  if (!tokens.refresh) throw new Error('no refresh token')
  const r = await fetch(`${BASE}/api/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: tokens.refresh }),
  })
  if (!r.ok) {
    tokens.clear()
    throw new Error('refresh failed')
  }
  const data = await r.json()
  tokens.set(data.access, null)
  return data.access
}

export async function request(path, { method = 'GET', body, auth = false, retry = true, raw = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth && tokens.access) headers.Authorization = `Bearer ${tokens.access}`

  const init = { method, headers }
  if (body !== undefined) init.body = JSON.stringify(body)

  let response = await fetch(`${BASE}${path}`, init)

  if (response.status === 401 && auth && retry && tokens.refresh) {
    try {
      await refresh()
      headers.Authorization = `Bearer ${tokens.access}`
      response = await fetch(`${BASE}${path}`, { ...init, headers })
    } catch {
      // fall through to error handling
    }
  }

  if (raw) return response

  if (!response.ok) {
    let detail
    try { detail = await response.json() } catch { detail = { detail: response.statusText } }
    const err = new Error(detail.detail || `HTTP ${response.status}`)
    err.status = response.status
    err.data = detail
    throw err
  }

  if (response.status === 204) return null
  return response.json()
}

// ── Public endpoints ─────────────────────────────────────────────────
export const api = {
  // Auth
  register: (payload)            => request('/api/auth/register/', { method: 'POST', body: payload }),
  login:    (email, password)    => request('/api/auth/login/',    { method: 'POST', body: { email, password } }),
  me:       ()                   => request('/api/auth/me/',       { auth: true }),

  // Public scanning
  guestScan:        (hostname)   => request('/api/public/scan/',        { method: 'POST', body: { hostname } }),
  guestScanDetail:  (id)         => request(`/api/public/scan/${id}/`),
  sharedReport:     (token)      => request(`/api/public/report/${token}/`),
  publicDashboard:  ()           => request('/api/public/dashboard/'),
  badgeUrl:         (hostname)   => `${BASE}/api/public/badge/${encodeURIComponent(hostname)}/`,

  // Domains
  domains:     ()                => request('/api/domains/',                  { auth: true }),
  addDomain:   (hostname)        => request('/api/domains/',                  { auth: true, method: 'POST', body: { hostname } }),
  verifyDomain:(id)              => request(`/api/domains/${id}/verify/`,     { auth: true, method: 'POST' }),
  scanDomain:  (id)              => request(`/api/domains/${id}/scan/`,       { auth: true, method: 'POST' }),
  domainHistory:(id)             => request(`/api/domains/${id}/history/`,    { auth: true }),

  // Scans
  scan:       (id)               => request(`/api/scans/${id}/`,              { auth: true }),
  scanReport: (id)               => request(`/api/scans/${id}/report/`,       { auth: true }),
  scanPdfUrl: (id)               => `${BASE}/api/scans/${id}/pdf/`,
  compare:    (a, b)             => request(`/api/scans/compare/?a=${a}&b=${b}`, { auth: true }),
}

export const BASE_URL = BASE
