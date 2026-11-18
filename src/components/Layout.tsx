import { useState, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  Coins,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Palette,
  UserPlus,
  UserRound,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBranding } from '../context/BrandingContext'
import { useWhatsapp } from '../hooks/useWhatsapp'
import { useSocialLinks } from './Contacto'

const adminLinks = [
  { to: '/admin', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/admin/productos', label: 'Servicios', icon: Wrench, end: false },
  { to: '/admin/clientes', label: 'Clientes', icon: Users, end: false },
  { to: '/admin/ordenes', label: 'Compras', icon: ClipboardList, end: false },
  { to: '/admin/recargas', label: 'Recargas', icon: Coins, end: false },
  { to: '/admin/marca', label: 'Marca', icon: Palette, end: false },
]

export function Layout({ children }: { children: ReactNode }) {
  const { isAdmin, isCliente, isDemo, signOut, user } = useAuth()
  const { logoUrl } = useBranding()
  const wa = useWhatsapp()
  const redes = useSocialLinks()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    setMenuOpen(false)
    navigate('/')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
    }`

  return (
    <div className="flex min-h-screen flex-col">
      {isDemo && (
        <div className="bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800">
          Modo demostración: los datos se guardan solo en este navegador. Configura Supabase para
          usar la web en varios dispositivos.
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center rounded-full bg-brand-600 text-white">
                  <Wrench className="h-5 w-5" />
                </span>
              )}
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-slate-900 sm:text-base">
                Servicio Tecnico Walter Molares
              </span>
              <span className="block text-[11px] text-slate-500">Reparación de teléfonos</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <NavLink to="/" end className={linkClass}>
              <Home className="h-4 w-4" /> Catálogo
            </NavLink>
            {isAdmin &&
              adminLinks.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} className={linkClass}>
                  <Icon className="h-4 w-4" /> {label}
                </NavLink>
              ))}
            {isCliente && (
              <NavLink to="/mi-cuenta" className={linkClass}>
                <UserRound className="h-4 w-4" /> Mi cuenta
              </NavLink>
            )}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <>
                {isCliente && (
                  <Link to="/mi-cuenta" className="btn-ghost">
                    <Coins className="h-4 w-4" /> Mis créditos
                  </Link>
                )}
                <span className="max-w-[150px] truncate text-xs text-slate-500" title={user.email}>
                  {user.email}
                </span>
                <button type="button" onClick={handleSignOut} className="btn-ghost">
                  <LogOut className="h-4 w-4" /> Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/registro" className="btn-ghost">
                  <UserPlus className="h-4 w-4" /> Crear cuenta
                </Link>
                <Link to="/login" className="btn-primary">
                  <LogIn className="h-4 w-4" /> Ingresar
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>
                <Home className="h-4 w-4" /> Catálogo
              </NavLink>
              {isAdmin &&
                adminLinks.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={linkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </NavLink>
                ))}
              {isCliente && (
                <NavLink
                  to="/mi-cuenta"
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  <UserRound className="h-4 w-4" /> Mi cuenta
                </NavLink>
              )}
              {user ? (
                <button type="button" onClick={handleSignOut} className={`${linkClass} text-left`}>
                  <LogOut className="h-4 w-4" /> Salir
                </button>
              ) : (
                <>
                  <NavLink
                    to="/registro"
                    className={linkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    <UserPlus className="h-4 w-4" /> Crear cuenta
                  </NavLink>
                  <NavLink
                    to="/login"
                    className={linkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4" /> Ingresar
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Servicio Tecnico Walter Molares</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a
              href={wa.general()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-600 hover:underline"
            >
              WhatsApp: +{wa.phone}
            </a>
            {redes.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                aria-label={label}
                className="text-slate-400 hover:text-brand-600"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
