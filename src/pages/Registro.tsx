import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Lock, Mail, User } from 'lucide-react'
import { ErrorAlert, Field, Spinner } from '../components/ui'
import { useAuth } from '../context/AuthContext'

export default function Registro() {
  const { signUp, isAdmin, isCliente, loading } = useAuth()
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <Spinner label="Verificando sesión…" />
  if (isAdmin) return <Navigate to="/admin" replace />
  if (isCliente) return <Navigate to="/mi-cuenta" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')

    if (nombre.trim().length < 2) {
      setError('Ingresá tu nombre.')
      return
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setSubmitting(true)
    try {
      const { requiereConfirmacion } = await signUp(email, password, nombre)
      if (requiereConfirmacion) {
        setNotice(
          'Listo: te enviamos un correo para confirmar tu cuenta. Abrí ese enlace y después ingresá con tu contraseña.',
        )
      } else {
        navigate('/mi-cuenta', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14">
      <div className="card p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Crear mi cuenta</h1>
          <p className="mt-1 text-sm text-slate-500">
            Registrate para ver tu saldo, recargar créditos y pagar servicios desde tu cuenta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nombre">
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-9"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                required
              />
            </div>
          </Field>
          <Field label="Correo electrónico">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                autoComplete="username"
                className="input pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vos@ejemplo.com"
                required
              />
            </div>
          </Field>
          <Field label="Contraseña" hint="Mínimo 6 caracteres.">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                autoComplete="new-password"
                className="input pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </Field>
          <Field label="Repetir contraseña">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                autoComplete="new-password"
                className="input pl-9"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                required
              />
            </div>
          </Field>

          {error && <ErrorAlert message={error} />}
          {notice && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
              {notice}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            Ingresá acá
          </Link>
        </p>
      </div>
    </div>
  )
}
