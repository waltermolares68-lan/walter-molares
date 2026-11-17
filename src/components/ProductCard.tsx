import { useState } from 'react'
import { ImageOff, Tag } from 'lucide-react'
import type { Producto } from '../types'
import { useWhatsapp } from '../hooks/useWhatsapp'
import { formatPrice } from '../lib/format'
import { WhatsAppLink } from './ui'

export function ProductCard({ producto }: { producto: Producto }) {
  const [imageError, setImageError] = useState(false)
  const wa = useWhatsapp()

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
        <WhatsAppLink
          href={wa.producto(producto)}
          label="Consultar por WhatsApp"
          className="btn-whatsapp mt-4 w-full"
        />
      </div>
    </article>
  )
}
