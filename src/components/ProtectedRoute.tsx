import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from './ui'

interface Props {
  children: ReactNode
  /** Rol requerido. Por defecto, administrador. */
  role?: 'admin' | 'cliente'
}

export function ProtectedRoute({ children, role = 'admin' }: Props) {
  const { loading, user, isAdmin, isCliente } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner label="Verificando sesión…" />
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const permitido = role === 'admin' ? isAdmin : isCliente
  if (!permitido) {
    return <Navigate to={isAdmin ? '/admin' : '/mi-cuenta'} replace />
  }

  return <>{children}</>
}

export function AdminRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute role="admin">{children}</ProtectedRoute>
}

export function ClienteRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute role="cliente">{children}</ProtectedRoute>
}
