import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { AppRole } from '../types'

type AppUser = (Pick<User, 'id' | 'email'> & { role: AppRole }) | null

interface AuthContextValue {
  user: AppUser
  isAdmin: boolean
  isCliente: boolean
  loading: boolean
  isDemo: boolean
  signIn: (email: string, password: string) => Promise<AppRole>
  signUp: (email: string, password: string, nombre: string) => Promise<{ requiereConfirmacion: boolean }>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const DEMO_EMAIL = 'admin@demo.local'
const DEMO_PASSWORD = 'demo1234'
const DEMO_SESSION_KEY = 'stwm.session.v1'
const DEMO_ROLE_KEY = 'stwm.session.role.v1'

function demoId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `user-${Date.now()}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser>(null)
  const [loading, setLoading] = useState(true)
  const isDemo = !isSupabaseConfigured

  async function cargarPerfil(authUser: User | null): Promise<AppRole | null> {
    if (!authUser) {
      setUser(null)
      return null
    }

    const base = { id: authUser.id, email: authUser.email }

    if (!supabase) {
      const role = (localStorage.getItem(DEMO_ROLE_KEY) as AppRole) || 'admin'
      setUser({ ...base, role })
      return role
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle()

    if (error) {
      // Si faltó ejecutar el SQL, el perfil no existe: por seguridad se trata como cliente.
      console.error('No se pudo leer el perfil:', error.message)
      setUser({ ...base, role: 'cliente' })
      return 'cliente'
    }

    const role = (data?.role as AppRole) ?? 'cliente'
    setUser({ ...base, role })
    return role
  }

  useEffect(() => {
    if (!supabase) {
      try {
        const raw = localStorage.getItem(DEMO_SESSION_KEY)
        const sesion = raw ? (JSON.parse(raw) as AppUser) : null
        setUser(sesion)
        if (!sesion) localStorage.removeItem(DEMO_ROLE_KEY)
      } catch {
        setUser(null)
      }
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(async ({ data }) => {
      await cargarPerfil(data.session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void cargarPerfil(session?.user ?? null).finally(() => setLoading(false))
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string): Promise<AppRole> {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) throw error
      return (await cargarPerfil(data.user ?? null)) ?? 'cliente'
    }

    if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const demoUser: AppUser = { id: 'demo-admin', email: DEMO_EMAIL, role: 'admin' }
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser))
      localStorage.setItem(DEMO_ROLE_KEY, 'admin')
      setUser(demoUser)
      return 'admin'
    }

    const guardado = localStorage.getItem(DEMO_SESSION_KEY)
    if (guardado) {
      const sesion = JSON.parse(guardado) as AppUser
      if (sesion?.email?.toLowerCase() === email.trim().toLowerCase()) {
        const conRol: AppUser = { ...sesion, role: 'cliente' }
        localStorage.setItem(DEMO_ROLE_KEY, 'cliente')
        setUser(conRol)
        return 'cliente'
      }
    }

    throw new Error(`Credenciales incorrectas. En modo demo usa ${DEMO_EMAIL} / ${DEMO_PASSWORD}.`)
  }

  async function signUp(
    email: string,
    password: string,
    nombre: string,
  ): Promise<{ requiereConfirmacion: boolean }> {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { nombre: nombre.trim() } },
      })
      if (error) throw error
      // Si Supabase pide confirmar el email, no hay sesión todavía.
      return { requiereConfirmacion: !data.session }
    }

    const demoUser: AppUser = { id: demoId(), email: email.trim(), role: 'cliente' }
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser))
    localStorage.setItem(DEMO_ROLE_KEY, 'cliente')
    setUser(demoUser)
    return { requiereConfirmacion: false }
  }

  async function signOut(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut()
      setUser(null)
      return
    }
    localStorage.removeItem(DEMO_SESSION_KEY)
    localStorage.removeItem(DEMO_ROLE_KEY)
    setUser(null)
  }

  async function refresh(): Promise<void> {
    if (supabase) {
      const { data } = await supabase.auth.getUser()
      await cargarPerfil(data.user ?? null)
      return
    }
    const raw = localStorage.getItem(DEMO_SESSION_KEY)
    if (raw) setUser(JSON.parse(raw) as AppUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        isCliente: user?.role === 'cliente',
        loading,
        isDemo,
        signIn,
        signUp,
        signOut,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}

export { DEMO_EMAIL, DEMO_PASSWORD }
