import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { BrandingProvider } from './context/BrandingContext'
import Branding from './pages/Branding'
import Catalogo from './pages/Catalogo'
import Clientes from './pages/Clientes'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Ordenes from './pages/Ordenes'
import Productos from './pages/Productos'

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">Página no encontrada</h1>
      <p className="mt-2 text-sm text-slate-500">El enlace puede haber cambiado.</p>
      <Link to="/" className="btn-primary mt-6">Volver al catálogo</Link>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <BrandingProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Catalogo />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/productos"
                element={
                  <ProtectedRoute>
                    <Productos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/clientes"
                element={
                  <ProtectedRoute>
                    <Clientes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/ordenes"
                element={
                  <ProtectedRoute>
                    <Ordenes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/marca"
                element={
                  <ProtectedRoute>
                    <Branding />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrandingProvider>
      </AuthProvider>
    </HashRouter>
  )
}
