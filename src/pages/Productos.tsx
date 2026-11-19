import { useEffect, useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { ImageUpload } from '../components/ImageUpload'
import {
  ConfirmDialog,
  EmptyState,
  ErrorAlert,
  Field,
  Modal,
  Spinner,
  WhatsAppLink,
} from '../components/ui'
import { createProducto, deleteProducto, getProductos, updateProducto, type ProductoInput } from '../lib/data'
import { formatCreditos, formatPrice } from '../lib/format'
import { useWhatsapp } from '../hooks/useWhatsapp'
import { CATEGORIAS, type Categoria, type Producto } from '../types'

interface FormState {
  codigo: string
  nombre: string
  categoria: Categoria
  descripcion: string
  precio: string
  creditos: string
  imagen_url: string
  activo: boolean
}

function emptyForm(codigo: string): FormState {
  return {
    codigo,
    nombre: '',
    categoria: 'Reparación',
    descripcion: '',
    precio: '',
    creditos: '1',
    imagen_url: '',
    activo: true,
  }
}

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Producto | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm('SRV-001'))
  const [saving, setSaving] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const wa = useWhatsapp()

  function cargar() {
    setLoading(true)
    getProductos()
      .then(setProductos)
      .catch((err: Error) => setPageError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(cargar, [])

  function openNew() {
    setEditing(null)
    setForm(emptyForm(`SRV-${String(productos.length + 1).padStart(3, '0')}`))
    setError('')
    setModalOpen(true)
  }

  function openEdit(producto: Producto) {
    setEditing(producto)
    setForm({
      codigo: producto.codigo,
      nombre: producto.nombre,
      categoria: producto.categoria,
      descripcion: producto.descripcion,
      precio: String(producto.precio),
      creditos: String(producto.creditos ?? 0),
      imagen_url: producto.imagen_url,
      activo: producto.activo,
    })
    setError('')
    setModalOpen(true)
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const payload: ProductoInput = {
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      descripcion: form.descripcion.trim(),
      precio: Number(form.precio) || 0,
      creditos: Math.max(0, Math.round((Number(form.creditos) || 0) * 100) / 100),
      imagen_url: form.imagen_url.trim(),
      activo: form.activo,
    }

    if (!payload.codigo || !payload.nombre) {
      setError('El código y el nombre son obligatorios.')
      return
    }

    setSaving(true)
    try {
      if (editing) await updateProducto(editing.id, payload)
      else await createProducto(payload)
      setNotice(editing ? 'Servicio actualizado correctamente.' : 'Servicio creado correctamente.')
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
      await deleteProducto(confirmId)
      setConfirmId(null)
      setNotice('Servicio eliminado correctamente.')
      cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar.')
      setConfirmId(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Servicios y productos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestioná el catálogo que ven tus clientes en la web.
          </p>
        </div>
        <button type="button" onClick={openNew} className="btn-primary">
          <Plus className="h-4 w-4" /> Nuevo servicio
        </button>
      </div>

      {notice && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          {notice}
        </div>
      )}
      {pageError && <div className="mb-4"><ErrorAlert message={pageError} /></div>}
      {error && !modalOpen && <div className="mb-4"><ErrorAlert message={error} /></div>}

      {loading ? (
        <Spinner />
      ) : productos.length === 0 ? (
        <EmptyState title="Catálogo vacío" description="Creá tu primer servicio con el botón «Nuevo servicio»." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Servicio</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Créditos</th>
                  <th className="px-4 py-3">Visible</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-700">{producto.codigo}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{producto.nombre}</p>
                      <p className="max-w-xs truncate text-xs text-slate-400">{producto.descripcion}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{producto.categoria}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{formatPrice(producto.precio)}</td>
                    <td className="px-4 py-3">
                      {producto.creditos > 0 ? (
                        <span className="badge bg-brand-100 text-brand-700">
                          {formatCreditos(producto.creditos)} cr.
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${producto.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {producto.activo ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {producto.activo && (
                          <WhatsAppLink
                            href={wa.producto(producto)}
                            label="WhatsApp"
                            className="btn-whatsapp px-2.5 py-1.5 text-xs"
                          />
                        )}
                        <button type="button" onClick={() => openEdit(producto)} className="btn-ghost px-2.5 py-1.5 text-xs" title="Editar">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => setConfirmId(producto.id)} className="btn-ghost px-2.5 py-1.5 text-xs text-red-600" title="Eliminar">
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
        title={editing ? 'Editar servicio' : 'Nuevo servicio'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" form="producto-form" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </>
        }
      >
        <form id="producto-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Código (aparece en WhatsApp)">
              <input className="input" value={form.codigo} onChange={(e) => updateField('codigo', e.target.value)} required />
            </Field>
            <Field label="Categoría">
              <select className="input" value={form.categoria} onChange={(e) => updateField('categoria', e.target.value as Categoria)}>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Nombre">
            <input className="input" value={form.nombre} onChange={(e) => updateField('nombre', e.target.value)} required />
          </Field>
          <Field label="Descripción">
            <textarea className="input min-h-[80px]" value={form.descripcion} onChange={(e) => updateField('descripcion', e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Precio (AR$)">
              <input type="number" min="0" step="0.01" className="input" value={form.precio} onChange={(e) => updateField('precio', e.target.value)} required />
            </Field>
            <Field label="Costo en créditos" hint="1 crédito = 1 USD. Podés poner decimales, por ejemplo 0,99. Poné 0 si solo se consulta por WhatsApp.">
              <input type="number" min="0" step="0.01" className="input" value={form.creditos} onChange={(e) => updateField('creditos', e.target.value)} />
            </Field>
          </div>
          <Field label="Visible en el catálogo" hint="Desactivá en lugar de eliminar si ya tiene compras.">
            <select className="input" value={form.activo ? 'si' : 'no'} onChange={(e) => updateField('activo', e.target.value === 'si')}>
              <option value="si">Sí, visible</option>
              <option value="no">No, oculto</option>
            </select>
          </Field>
          <ImageUpload
            label="Imagen del servicio"
            value={form.imagen_url}
            onChange={(url) => updateField('imagen_url', url)}
            folder="productos"
            hint="Subí tu propia imagen o pegá una URL de stock con licencia libre. Si falla, se muestra un placeholder."
          />
          {error && modalOpen && <ErrorAlert message={error} />}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmId)}
        title="Eliminar servicio"
        message="¿Querés eliminar este servicio? Si ya tiene compras asociadas, desactívalo en su lugar."
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
