import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Smartphone } from 'lucide-react'
import { Contacto } from '../components/Contacto'
import { ProductCard } from '../components/ProductCard'
import { EmptyState, ErrorAlert, Spinner, WhatsAppLink } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useBranding } from '../context/BrandingContext'
import { useWhatsapp } from '../hooks/useWhatsapp'
import { getProductos } from '../lib/data'
import { CATEGORIAS, type Categoria, type Producto } from '../types'

export default function Catalogo() {
  const { isAdmin } = useAuth()
  const { bannerUrl } = useBranding()
  const wa = useWhatsapp()
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [categoria, setCategoria] = useState<'Todas' | Categoria>('Todas')

  useEffect(() => {
    getProductos(false)
      .then(setProductos)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtrados = useMemo(() => {
    const query = search.trim().toLowerCase()
    return productos.filter((producto) => {
      const porCategoria = categoria === 'Todas' || producto.categoria === categoria
      const texto = `${producto.nombre} ${producto.codigo} ${producto.descripcion}`.toLowerCase()
      return porCategoria && (!query || texto.includes(query))
    })
  }, [productos, search, categoria])

  return (
    <>
      <section className="bg-gradient-to-br from-brand-800 via-brand-700 to-brand-500 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:grid-cols-2 md:items-center md:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <Smartphone className="h-4 w-4" /> Reparación y accesorios
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              Tu teléfono, en buenas manos
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-brand-50">
              Servicio Tecnico Walter Molares. Elegí el servicio o producto que necesitás y
              escribinos por WhatsApp: el mensaje ya incluye el código y el precio para que
              sepas exactamente de qué se trata.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="btn-ghost border-0 bg-white text-brand-700 hover:bg-brand-50"
              >
                Ver servicios
              </button>
              <WhatsAppLink
                href={wa.general()}
                label="Escribinos por WhatsApp"
                className="btn-whatsapp"
              />
            </div>
          </div>
          <div className="hidden justify-center md:flex">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-0 rotate-6 rounded-3xl bg-white/10" />
              <img
                src={bannerUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'}
                alt="Imagen de presentación del taller"
                className="relative max-h-80 rounded-3xl object-cover shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Servicios y productos</h2>
            <p className="mt-1 text-sm text-slate-500">
              Precios de referencia. Confirmá disponibilidad al escribirnos.
            </p>
          </div>
          {isAdmin && (
            <Link to="/admin/productos" className="btn-ghost self-start">
              Gestionar catálogo
            </Link>
          )}
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o código…"
              className="input pl-9"
            />
          </div>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as 'Todas' | Categoria)}
            className="input sm:w-56"
          >
            <option value="Todas">Todas las categorías</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="mb-5"><ErrorAlert message={error} /></div>}

        {loading ? (
          <Spinner />
        ) : filtrados.length === 0 ? (
          <EmptyState
            title="No encontramos resultados"
            description="Probá con otra búsqueda o cambiá la categoría."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </section>

      <Contacto />
    </>
  )
}
