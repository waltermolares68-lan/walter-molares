import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ClipboardList, Package, Users } from 'lucide-react'
import { ErrorAlert, EstadoBadge, Spinner, WhatsAppLink } from '../components/ui'
import { getClientes, getOrdenes, getProductos } from '../lib/data'
import { formatDate, formatPrice } from '../lib/format'
import { useWhatsapp } from '../hooks/useWhatsapp'
import type { Cliente, OrdenConDetalle, Producto } from '../types'

export default function Dashboard() {
  const [ordenes, setOrdenes] = useState<OrdenConDetalle[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const wa = useWhatsapp()

  useEffect(() => {
    Promise.all([getOrdenes(), getClientes(), getProductos()])
      .then(([o, c, p]) => {
        setOrdenes(o)
        setClientes(c)
        setProductos(p)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const activas = ordenes.filter((o) => !['Entregado', 'Cancelado'].includes(o.estado)).length
  const listas = ordenes.filter((o) => o.estado === 'Listo').length

  const stats = [
    { label: 'Compras registradas', value: ordenes.length, icon: ClipboardList, color: 'bg-brand-50 text-brand-700' },
    { label: 'En curso', value: activas, icon: Package, color: 'bg-amber-50 text-amber-700' },
    { label: 'Listas para entregar', value: listas, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Clientes', value: clientes.length, icon: Users, color: 'bg-violet-50 text-violet-700' },
  ]

  if (loading) return <Spinner />

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Panel de administración</h1>
        <p className="mt-1 text-sm text-slate-500">Resumen del taller · {productos.length} servicios en catálogo</p>
      </div>

      {error && <div className="mb-5"><ErrorAlert message={error} /></div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4 p-5">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-bold text-slate-900">Últimas compras</h2>
          <Link to="/admin/ordenes" className="text-sm font-semibold text-brand-600 hover:underline">
            Ver todas
          </Link>
        </div>
        {ordenes.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">Todavía no hay compras registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Orden</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Servicio</th>
                  <th className="px-5 py-3">Precio</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordenes.slice(0, 6).map((orden) => (
                  <tr key={orden.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800">{orden.codigo}</p>
                      <p className="text-xs text-slate-400">{formatDate(orden.created_at)}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{orden.cliente?.nombre ?? '—'}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {orden.producto?.nombre ?? '—'}
                      <span className="block text-xs text-slate-400">{orden.producto?.codigo}</span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800">{formatPrice(orden.precio)}</td>
                    <td className="px-5 py-3"><EstadoBadge estado={orden.estado} /></td>
                    <td className="px-5 py-3">
                      <WhatsAppLink
                        href={wa.orden(orden)}
                        label="Abrir"
                        className="btn-whatsapp px-3 py-1.5 text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
