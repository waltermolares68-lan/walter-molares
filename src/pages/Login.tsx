import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Lock, Mail, User } from 'lucide-react'
import { ErrorAlert, Field, Spinner } from '../components/ui'
import { DEMO_EMAIL, DEMO_PASSWORD, useAuth } from '../context/AuthContext'
import { usernameDisponible } from '../lib/creditos'

const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/

export default function Login() {
  const { signIn, signUp, isAdmin, isLoggedIn, loading, isDemo } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const [modo, setModo] = useState<'entrar' | 'crear'>('entrar')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <Spinner label="Verificando sesión…" />
  if (isLoggedIn) return <Navigate to={from ?? (isAdmin ? '/admin' : '/cuenta')} replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setAviso('')
    setSubmitting(true)
    try {
      if (modo === 'entrar') {
        await signIn(email.trim(), password)
        navigate(from ?? '/cuenta', { replace: true })
        return
      }

      const nombre = username.trim()
      if (!USERNAME_RE.test(nombre)) {
        throw new Error('El usuario debe tener de 3 a 20 letras, números o guion bajo (sin espacios).')
      }
      if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.')
      if (!(await usernameDisponible(nombre))) {
        throw new Error('Ese nombre de usuario ya está en uso. Elegí otro.')
      }
      const { needsConfirmation } = await signUp(email.trim(), password, nombre)
      if (needsConfirmation) {
        setAviso('Cuenta creada. Revisá tu correo y confirmá el enlace para poder ingresar.')
        setModo('entrar')
        setPassword('')
      } else {
        navigate(from ?? '/cuenta', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la operación.')
    } finally {
      setSubmitting(false)
    }
  }

  const tab = (activo: boolean) =>
    `flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
      activo ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'
    }`

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10">
      <div className="card p-6 sm:p-8">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-900">Mi cuenta</h1>
          <p className="mt-1 text-sm text-slate-500">
            Creá tu cuenta, recargá créditos y comprá servicios. 1 crédito = 1 dólar.
          </p>
        </div>

        <div className="mb-5 flex gap-1 rounded-xl bg-slate-100 p-1">
          <button type="button" className={tab(modo === 'entrar')} onClick={() => { setModo('entrar'); setError('') }}>
            Ingresar
          </button>
          <button type="button" className={tab(modo === 'crear')} onClick={() => { setModo('crear'); setError('') }}>
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {modo === 'crear' && (
            <Field label="Nombre de usuario" hint="Es único: no puede repetirse. Ej: juan_perez">
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  autoComplete="username"
                  required
                  maxLength={20}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input pl-9"
                  placeholder="tu_usuario"
                />
              </div>
            </Field>
          )}

          <Field label="Correo electrónico">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-9"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </Field>

          <Field label="Contraseña">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                autoComplete={modo === 'crear' ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-9"
                placeholder="••••••••"
              />
            </div>
          </Field>

          {aviso && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">{aviso}</div>
          )}
          {error && <ErrorAlert message={error} />}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Procesando…' : modo === 'entrar' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>

        {isDemo && (
          <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            <strong className="block text-slate-800">Modo demostración</strong>
            Usuario: <code className="font-mono">{DEMO_EMAIL}</code>
            <br />
            Contraseña: <code className="font-mono">{DEMO_PASSWORD}</code>
          </div>
        )}
      </div>
    </div>
  )
}
