import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coins, ImageOff, Loader2, Tag } from 'lucide-react'
import type { Producto } from '../types'
import { useAuth } from '../context/AuthContext'
import { useWhatsapp } from '../hooks/useWhatsapp'
import { pagarConCreditos } from '../lib/data'
import { formatPrice } from '../lib/format'
import { WhatsAppLink } from './ui'

export function ProductCard({ producto }: { producto: Producto }) {
  const [imageError, setImageError] = useState(false)
  const [comprando, setComprando] = useState(false)
  const [error, setError] = useState('')
  const [codigoCompra, setCodigoCompra] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()
  const wa = useWhatsapp()

  async function handleComprar() {
    if (producto.creditos <= 0) return
    if (!user) {
      navigate('/login')
      return
    }
    setComprando(true)
    setError('')
    setCodigoCompra('')
    try {
      const orden = await pagarConCreditos(producto, user.id)
      setCodigoCompra(orden.codigo)
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'No se pudo completar la compra.'
      setError(mensaje)
      if (/saldo insuficiente/i.test(mensaje)) navigate('/mi-cuenta')
    } finally {
      setComprando(false)
    }
  }

  return (
    <article className="card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-44 bg-slate-100">
        {producto.imagen_url && !imageError ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
            <ImageOff className="h-8 w-8" />
            <span className="text-xs">Imagen de ejemplo</span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[11px] font-bold text-brand-700 shadow-sm">
          {producto.codigo}
        </span>
        {producto.creditos > 0 && (
          <span className="absolute right-3 top-3 rounded-md bg-brand-700 px-2 py-1 text-[11px] font-bold text-white shadow-sm">
            {producto.creditos} créditos
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
          <Tag className="h-3.5 w-3.5" /> {producto.categoria}
        </span>
        <h3 className="text-base font-bold leading-snug text-slate-900">{producto.nombre}</h3>
        <p className="mt-1.5 flex-1 text-sm leading-6 text-slate-500">
          {producto.descripcion || 'Sin descripción.'}
        </p>
        <p className="mt-3 text-xl font-extrabold text-brand-700">
          {formatPrice(producto.precio)}
        </p>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        {codigoCompra && (
          <p className="mt-2 rounded-lg bg-emerald-50 px-2 py-1.5 text-xs text-emerald-700">
            ¡Compra registrada! Código {codigoCompra}. La ves en «Mi cuenta».
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleComprar}
            disabled={comprando || producto.creditos <= 0}
            title={
              producto.creditos <= 0
                ? 'Este servicio todavía no tiene costo en créditos. Consultá por WhatsApp.'
                : undefined
            }
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {comprando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Coins className="h-4 w-4" />
            )}
            {producto.creditos <= 0
              ? 'Sin créditos'
              : !user
                ? 'Ingresá para comprar'
                : comprando
                  ? 'Procesando…'
                  : `Comprar con ${producto.creditos} créditos`}
          </button>
          <WhatsAppLink
            href={wa.producto(producto)}
            label="Consultar por WhatsApp"
            className="btn-whatsapp flex-1 px-3 py-2.5 text-xs"
          />
        </div>
      </div>
    </article>
  )
}
