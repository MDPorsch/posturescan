import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'

import Landing from './pages/Landing.jsx'
import ScanResults from './pages/ScanResults.jsx'
import PublicDashboard from './pages/PublicDashboard.jsx'
import SharedReport from './pages/SharedReport.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import AppDashboard from './pages/AppDashboard.jsx'
import DomainDetail from './pages/DomainDetail.jsx'
import ScanReport from './pages/ScanReport.jsx'
import Navbar from './components/Navbar.jsx'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-12 text-emerald-50/60">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function Shell() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/scan/results" element={<ScanResults />} />
          <Route path="/scan/results/:id" element={<ScanResults />} />
          <Route path="/dashboard" element={<PublicDashboard />} />
          <Route path="/report/:token" element={<SharedReport />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/app" element={<Protected><AppDashboard /></Protected>} />
          <Route path="/app/domains/:id" element={<Protected><DomainDetail /></Protected>} />
          <Route path="/app/scans/:id" element={<Protected><ScanReport /></Protected>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-border-subtle/60 py-8 text-center text-sm text-emerald-50/40 font-body">
        PostureScan · grade any domain&apos;s external security
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  )
}
