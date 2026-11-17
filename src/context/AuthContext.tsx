import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type AppUser = Pick<User, 'id' | 'email'> | null

interface AuthContextValue {
  user: AppUser
  isAdmin: boolean
  loading: boolean
  isDemo: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const DEMO_EMAIL = 'admin@demo.local'
const DEMO_PASSWORD = 'demo1234'
const DEMO_SESSION_KEY = 'stwm.session.v1'

function toAppUser(user?: User | null): AppUser {
  return user ? { id: user.id, email: user.email } : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser>(null)
  const [loading, setLoading] = useState(true)
  const isDemo = !isSupabaseConfigured

  useEffect(() => {
    if (!supabase) {
      try {
        const raw = localStorage.getItem(DEMO_SESSION_KEY)
        setUser(raw ? (JSON.parse(raw) as AppUser) : null)
      } catch {
        setUser(null)
      }
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(toAppUser(data.session?.user))
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toAppUser(session?.user))
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return
    }

    if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const demoUser: AppUser = { id: 'demo-admin', email: DEMO_EMAIL }
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser))
      setUser(demoUser)
      return
    }

    throw new Error(`Credenciales incorrectas. En modo demo usa ${DEMO_EMAIL} / ${DEMO_PASSWORD}.`)
  }

  async function signOut(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut()
      return
    }
    localStorage.removeItem(DEMO_SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAdmin: Boolean(user), loading, isDemo, signIn, signOut }}
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
