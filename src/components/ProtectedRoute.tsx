import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from './ui'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner label="Verificando sesión…" />
  if (!isAdmin) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return <>{children}</>
}
