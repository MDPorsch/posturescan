/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, tokens } from '../api/client.js'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    if (!tokens.access) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const me = await api.me()
      setUser(me)
    } catch {
      tokens.clear()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refreshMe() }, [refreshMe])

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password)
    tokens.set(data.access, data.refresh)
    await refreshMe()
  }, [refreshMe])

  const register = useCallback(async (payload) => {
    await api.register(payload)
    await login(payload.email, payload.password)
  }, [login])

  const logout = useCallback(() => {
    tokens.clear()
    setUser(null)
  }, [])

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
