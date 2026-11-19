import { useEffect, useState, type FormEvent } from 'react'
import { CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  ConfirmDialog,
  EmptyState,
  ErrorAlert,
  EstadoBadge,
  Field,
  Modal,
  Spinner,
  WhatsAppLink,
} from '../components/ui'
import {
  createOrden,
  deleteOrden,
  getClientes,
  getOrdenes,
  getProductos,
  updateOrden,
  type OrdenInput,
} from '../lib/data'
import { formatCreditos, formatDate, formatPrice } from '../lib/format'
import { useWhatsapp } from '../hooks/useWhatsapp'
import {
  ESTADOS,
  type Cliente,
  type EstadoOrden,
  type OrdenConDetalle,
  type Producto,
} from '../types'

interface FormState {
  cliente_id: string
  producto_id: string
  estado: EstadoOrden
  precio: string
  notas: string
  correo_entrega: string
  clave_entrega: string
}

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState<OrdenConDetalle[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [filtro, setFiltro] = useState<'Todos' | EstadoOrden>('Todos')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<OrdenConDetalle | null>(null)
  const [form, setForm] = useState<FormState>({
    cliente_id: '',
    producto_id: '',
    estado: 'Pendiente',
    precio: '',
    notas: '',
    correo_entrega: '',
    clave_entrega: '',
  })
  const [saving, setSaving] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [successOrder, setSuccessOrder] = useState<OrdenConDetalle | null>(null)
  const wa = useWhatsapp()

  function cargar() {
    setLoading(true)
    Promise.all([getOrdenes(), getClientes(), getProductos()])
      .then(([o, c, p]) => {
        setOrdenes(o)
        setClientes(c)
        setProductos(p)
      })
      .catch((err: Error) => setPageError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(cargar, [])

  function openNew() {
    setEditing(null)
    const primerProducto = productos.find((p) => p.activo) ?? productos[0]
    setForm({
      cliente_id: clientes[0]?.id ?? '',
      producto_id: primerProducto?.id ?? '',
      estado: 'Pendiente',
      precio: primerProducto ? String(primerProducto.precio) : '',
      notas: '',
      correo_entrega: '',
      clave_entrega: '',
    })
    setError('')
    setModalOpen(true)
  }

  function openEdit(orden: OrdenConDetalle) {
    setEditing(orden)
    setForm({
      cliente_id: orden.cliente_id,
      producto_id: orden.producto_id,
      estado: orden.estado,
      precio: String(orden.precio),
      notas: orden.notas,
      correo_entrega: orden.correo_entrega ?? '',
      clave_entrega: orden.clave_entrega ?? '',
    })
    setError('')
    setModalOpen(true)
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleProductoChange(id: string) {
    const producto = productos.find((p) => p.id === id)
    setForm((prev) => ({ ...prev, producto_id: id, precio: producto ? String(producto.precio) : prev.precio }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!form.cliente_id || !form.producto_id) {
      setError('Tenés que elegir un cliente y un servicio/producto.')
      return
    }

    const payload: OrdenInput = {
      cliente_id: form.cliente_id,
      producto_id: form.producto_id,
      estado: form.estado,
      precio: Number(form.precio) || 0,
      creditos_usados: 0,
      notas: form.notas.trim(),
      correo_entrega: form.correo_entrega.trim(),
      clave_entrega: form.clave_entrega.trim(),
      entregado_at:
        form.estado === 'Recibido'
          ? (editing?.entregado_at ?? new Date().toISOString())
          : null,
    }

    setSaving(true)
    try {
      if (editing) {
        await updateOrden(editing.id, payload)
        setNotice('Compra actualizada correctamente.')
      } else {
        const creada = await createOrden(payload)
        setSuccessOrder({
          ...creada,
          cliente: clientes.find((c) => c.id === payload.cliente_id),
          producto: productos.find((p) => p.id === payload.producto_id),
        })
        setNotice('')
      }
      setModalOpen(false)
      cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmId) return
    setDeleting(true)
    setError('')
    try {
      await deleteOrden(confirmId)
      setConfirmId(null)
      setNotice('Compra eliminada correctamente.')
      cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar.')
      setConfirmId(null)
    } finally {
      setDeleting(false)
    }
  }

  const visibles = ordenes.filter((o) => filtro === 'Todos' || o.estado === filtro)
  const pendientes = ordenes.filter((o) => o.estado === 'Pendiente').length

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Compras y reparaciones</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cada compra tiene su botón de WhatsApp con el código, el producto y el precio.
          </p>
        </div>
        <button type="button" onClick={openNew} className="btn-primary" disabled={clientes.length === 0 || productos.length === 0}>
          <Plus className="h-4 w-4" /> Nueva compra
        </button>
      </div>

      {successOrder && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
              <div>
                <p className="font-bold text-emerald-900">Compra {successOrder.codigo} creada</p>
                <p className="text-sm text-emerald-800">
                  {successOrder.producto?.nombre} · {formatPrice(successOrder.precio)}. El mensaje ya incluye el producto y el precio.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <WhatsAppLink href={wa.orden(successOrder)} label="Enviar por WhatsApp" />
              <button type="button" className="btn-ghost" onClick={() => setSuccessOrder(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {notice && <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">{notice}</div>}
      {pageError && <div className="mb-4"><ErrorAlert message={pageError} /></div>}
      {error && !modalOpen && <div className="mb-4"><ErrorAlert message={error} /></div>}

      {pendientes > 0 && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Hay <strong>{pendientes}</strong> compra(s) pendiente(s). Revisá el estado
            «Pendiente», cargá el correo y la contraseña de la renta y marcala como
            «Recibido».
          </p>
        </div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium text-slate-600" htmlFor="filtro-estado">Filtrar por estado:</label>
        <select id="filtro-estado" className="input max-w-xs" value={filtro} onChange={(e) => setFiltro(e.target.value as 'Todos' | EstadoOrden)}>
          <option value="Todos">Todos</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : visibles.length === 0 ? (
        <EmptyState title="Sin compras" description="Registrá la primera compra con el botón «Nueva compra»." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Orden</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Producto / servicio</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Créditos</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibles.map((orden) => (
                  <tr key={orden.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-semibold text-brand-700">{orden.codigo}</p>
                      <p className="text-xs text-slate-400">{formatDate(orden.created_at)}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{orden.cliente?.nombre ?? '—'}</td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">{orden.producto?.nombre ?? '—'}</p>
                      <p className="font-mono text-xs text-slate-400">{orden.producto?.codigo}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{formatPrice(orden.precio)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {orden.creditos_usados > 0 ? formatCreditos(orden.creditos_usados) : '—'}
                    </td>
                    <td className="px-4 py-3"><EstadoBadge estado={orden.estado} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <WhatsAppLink href={wa.orden(orden)} label="WhatsApp" className="btn-whatsapp px-2.5 py-1.5 text-xs" />
                        <button type="button" onClick={() => openEdit(orden)} className="btn-ghost px-2.5 py-1.5 text-xs" title="Editar">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => setConfirmId(orden.id)} className="btn-ghost px-2.5 py-1.5 text-xs text-red-600" title="Eliminar">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? `Editar ${editing.codigo}` : 'Nueva compra'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" form="orden-form" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar compra'}
            </button>
          </>
        }
      >
        <form id="orden-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cliente">
              <select className="input" value={form.cliente_id} onChange={(e) => updateField('cliente_id', e.target.value)} required>
                <option value="">Seleccionar cliente…</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </Field>
            <Field label="Producto / servicio" hint="Al elegirlo se completa el precio automáticamente.">
              <select className="input" value={form.producto_id} onChange={(e) => handleProductoChange(e.target.value)} required>
                <option value="">Seleccionar…</option>
                {productos.map((p) => <option key={p.id} value={p.id}>{p.codigo} · {p.nombre}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Estado">
              <select className="input" value={form.estado} onChange={(e) => updateField('estado', e.target.value as EstadoOrden)}>
                {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </Field>
            <Field label="Precio de la compra">
              <input type="number" min="0" step="0.01" className="input" value={form.precio} onChange={(e) => updateField('precio', e.target.value)} required />
            </Field>
          </div>
          <Field label="Notas internas">
            <textarea className="input min-h-[80px]" value={form.notas} onChange={(e) => updateField('notas', e.target.value)} />
          </Field>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-800">Datos de la renta</p>
            <p className="mb-3 text-xs text-slate-500">
              Cargalos acá y marcá la compra como «Recibido». El cliente los va a ver en
              «Mi cuenta».
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Correo de la renta">
                <input
                  type="text"
                  className="input"
                  placeholder="usuario@renta.com"
                  value={form.correo_entrega}
                  onChange={(e) => updateField('correo_entrega', e.target.value)}
                />
              </Field>
              <Field label="Contraseña de la renta">
                <input
                  type="text"
                  className="input font-mono"
                  placeholder="Contraseña"
                  value={form.clave_entrega}
                  onChange={(e) => updateField('clave_entrega', e.target.value)}
                />
              </Field>
            </div>
          </div>
          {error && modalOpen && <ErrorAlert message={error} />}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmId)}
        title="Eliminar compra"
        message="¿Querés eliminar esta compra del registro? Esta acción no se puede deshacer."
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
