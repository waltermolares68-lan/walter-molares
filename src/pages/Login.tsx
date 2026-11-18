import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Lock, Mail, UserPlus } from 'lucide-react'
import { ErrorAlert, Field, Spinner } from '../components/ui'
import { DEMO_EMAIL, DEMO_PASSWORD, useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn, isAdmin, isCliente, loading, isDemo } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = (location.state as { from?: string } | null)?.from ?? '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <Spinner label="Verificando sesión…" />
  if (isAdmin) return <Navigate to={destino.startsWith('/admin') ? destino : '/admin'} replace />
  if (isCliente) return <Navigate to="/mi-cuenta" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const role = await signIn(email, password)
      navigate(
        role === 'admin'
          ? destino.startsWith('/admin')
            ? destino
            : '/admin'
          : '/mi-cuenta',
        { replace: true },
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14">
      <div className="card p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Ingresar</h1>
          <p className="mt-1 text-sm text-slate-500">
            Entrá para gestionar el taller o ver tu cuenta de créditos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Correo electrónico">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-9"
                placeholder="vos@ejemplo.com"
              />
            </div>
          </Field>

          <Field label="Contraseña">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-9"
                placeholder="••••••••"
              />
            </div>
          </Field>

          {error && <ErrorAlert message={error} />}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        {!isDemo && (
          <div className="mt-5 rounded-lg border border-brand-100 bg-brand-50 p-4 text-center">
            <p className="text-sm text-slate-700">¿Sos cliente y todavía no tenés cuenta?</p>
            <Link to="/registro" className="btn-primary mt-3 w-full justify-center">
              <UserPlus className="h-4 w-4" /> Crear mi cuenta
            </Link>
          </div>
        )}

        <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
          {isDemo ? (
            <>
              <strong className="block text-slate-800">Modo demostración</strong>
              Usuario: <code className="font-mono">{DEMO_EMAIL}</code>
              <br />
              Contraseña: <code className="font-mono">{DEMO_PASSWORD}</code>
              <br />
              <span className="mt-1 block text-amber-700">
                Este acceso es solo visual: no protege datos reales.
              </span>
            </>
          ) : (
            <p>
              ¿Olvidaste tu contraseña? Si sos administrador, reseteala desde Supabase →
              Authentication → Users. Si sos cliente, pedile ayuda al administrador.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
