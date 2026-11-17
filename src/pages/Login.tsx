import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import { ErrorAlert, Field, Spinner } from '../components/ui'
import { DEMO_EMAIL, DEMO_PASSWORD, useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn, isAdmin, loading, isDemo } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <Spinner label="Verificando sesión…" />
  if (isAdmin) return <Navigate to={from} replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signIn(email, password)
      navigate(from, { replace: true })
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
          <h1 className="text-2xl font-bold text-slate-900">Acceso de administrador</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ingresá para gestionar servicios, clientes y compras.
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
                placeholder="admin@ejemplo.com"
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
            <>
              <strong className="block text-slate-800">¿No tenés usuario?</strong>
              Pedile al administrador que lo cree en Supabase → Authentication → Users.
            </>
          )}
        </div>
      </div>
    </div>
  )
}
