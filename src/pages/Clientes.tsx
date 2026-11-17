import { useEffect, useState, type FormEvent } from 'react'
import { MessageCircle, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  ConfirmDialog,
  EmptyState,
  ErrorAlert,
  Field,
  Modal,
  Spinner,
} from '../components/ui'
import { createCliente, deleteCliente, getClientes, updateCliente, type ClienteInput } from '../lib/data'
import { formatDate } from '../lib/format'
import type { Cliente } from '../types'

interface FormState {
  nombre: string
  telefono: string
  direccion: string
  notas: string
}

const emptyForm: FormState = { nombre: '', telefono: '', direccion: '', notas: '' }

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  function cargar() {
    setLoading(true)
    getClientes()
      .then(setClientes)
      .catch((err: Error) => setPageError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(cargar, [])

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setModalOpen(true)
  }

  function openEdit(cliente: Cliente) {
    setEditing(cliente)
    setForm({
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      notas: cliente.notas,
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
    const payload: ClienteInput = {
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      direccion: form.direccion.trim(),
      notas: form.notas.trim(),
    }
    if (!payload.nombre) {
      setError('El nombre es obligatorio.')
      return
    }
    setSaving(true)
    try {
      if (editing) await updateCliente(editing.id, payload)
      else await createCliente(payload)
      setNotice(editing ? 'Cliente actualizado correctamente.' : 'Cliente creado correctamente.')
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
      await deleteCliente(confirmId)
      setConfirmId(null)
      setNotice('Cliente eliminado correctamente.')
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
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Clientes</h1>
          <p className="mt-1 text-sm text-slate-500">Registro interno para asociar cada compra.</p>
        </div>
        <button type="button" onClick={openNew} className="btn-primary">
          <Plus className="h-4 w-4" /> Nuevo cliente
        </button>
      </div>

      {notice && <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">{notice}</div>}
      {pageError && <div className="mb-4"><ErrorAlert message={pageError} /></div>}
      {error && !modalOpen && <div className="mb-4"><ErrorAlert message={error} /></div>}

      {loading ? (
        <Spinner />
      ) : clientes.length === 0 ? (
        <EmptyState title="Sin clientes" description="Creá tu primer cliente con el botón «Nuevo cliente»." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Dirección</th>
                  <th className="px-4 py-3">Alta</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientes.map((cliente) => {
                  const phone = cliente.telefono.replace(/\D/g, '')
                  return (
                    <tr key={cliente.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{cliente.nombre}</p>
                        <p className="max-w-xs truncate text-xs text-slate-400">{cliente.notas}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{cliente.telefono || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{cliente.direccion || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(cliente.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {phone && (
                            <a
                              href={`https://wa.me/${phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-whatsapp px-2.5 py-1.5 text-xs"
                              title="Escribir al cliente por WhatsApp"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <button type="button" onClick={() => openEdit(cliente)} className="btn-ghost px-2.5 py-1.5 text-xs" title="Editar">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" onClick={() => setConfirmId(cliente.id)} className="btn-ghost px-2.5 py-1.5 text-xs text-red-600" title="Eliminar">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Editar cliente' : 'Nuevo cliente'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" form="cliente-form" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </>
        }
      >
        <form id="cliente-form" onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nombre">
            <input className="input" value={form.nombre} onChange={(e) => updateField('nombre', e.target.value)} required />
          </Field>
          <Field label="Teléfono (con código de país, solo dígitos)" hint="Ejemplo: 5491135834902">
            <input className="input" value={form.telefono} onChange={(e) => updateField('telefono', e.target.value)} />
          </Field>
          <Field label="Dirección">
            <input className="input" value={form.direccion} onChange={(e) => updateField('direccion', e.target.value)} />
          </Field>
          <Field label="Notas internas">
            <textarea className="input min-h-[80px]" value={form.notas} onChange={(e) => updateField('notas', e.target.value)} />
          </Field>
          {error && modalOpen && <ErrorAlert message={error} />}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmId)}
        title="Eliminar cliente"
        message="¿Querés eliminar este cliente? No se podrá si tiene compras asociadas."
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
