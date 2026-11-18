import { useEffect, useState } from 'react'
import { Check, Coins, X } from 'lucide-react'
import { EmptyState, ErrorAlert, Field, Modal, Spinner } from '../components/ui'
import { getClientes, getRecargas, aprobarRecarga, rechazarRecarga } from '../lib/data'
import { formatDate } from '../lib/format'
import type { Cliente, Recarga, EstadoRecarga } from '../types'

const estilos: Record<EstadoRecarga, string> = {
  pendiente: 'bg-amber-100 text-amber-800',
  aprobada: 'bg-emerald-100 text-emerald-800',
  rechazada: 'bg-red-100 text-red-700',
}

export default function Recargas() {
  const [recargas, setRecargas] = useState<Recarga[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [procesando, setProcesando] = useState<string | null>(null)
  const [soloPendientes, setSoloPendientes] = useState(true)
  const [rechazando, setRechazando] = useState<Recarga | null>(null)
  const [motivo, setMotivo] = useState('')

  function cargar() {
    setLoading(true)
    Promise.all([getRecargas(), getClientes()])
      .then(([r, c]) => {
        setRecargas(r)
        setClientes(c)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(cargar, [])

  function nombreCliente(userId: string): string {
    return clientes.find((c) => c.user_id === userId)?.nombre ?? 'Cliente registrado'
  }

  async function handleAprobar(fila: Recarga) {
    setProcesando(fila.id)
    setError('')
    setNotice('')
    try {
      await aprobarRecarga(fila.id)
      setNotice(`Se acreditaron ${fila.creditos} créditos a ${nombreCliente(fila.user_id)}.`)
      cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo aprobar.')
    } finally {
      setProcesando(null)
    }
  }

  async function handleRechazar() {
    if (!rechazando) return
    setProcesando(rechazando.id)
    setError('')
    try {
      await rechazarRecarga(rechazando.id, motivo.trim())
      setNotice('Recarga rechazada.')
      setRechazando(null)
      setMotivo('')
      cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo rechazar.')
    } finally {
      setProcesando(null)
    }
  }

  const visibles = soloPendientes
    ? recargas.filter((r) => r.estado === 'pendiente')
    : recargas
  const pendientes = recargas.filter((r) => r.estado === 'pendiente').length

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            <Coins className="h-7 w-7 text-brand-600" /> Recargas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Revisá las transferencias por Binance Pay y acreditá los créditos.
          </p>
        </div>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setSoloPendientes((v) => !v)}
        >
          {soloPendientes ? `Ver todas (${recargas.length})` : `Solo pendientes (${pendientes})`}
        </button>
      </div>

      {notice && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          {notice}
        </div>
      )}
      {error && <div className="mb-4"><ErrorAlert message={error} /></div>}

      {loading ? (
        <Spinner />
      ) : visibles.length === 0 ? (
        <EmptyState
          title="No hay recargas pendientes"
          description="Cuando un cliente solicite una recarga, aparece acá con su referencia para verificarla."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Créditos</th>
                  <th className="px-4 py-3">Referencia</th>
                  <th className="px-4 py-3">Nota del cliente</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibles.map((fila) => (
                  <tr key={fila.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {nombreCliente(fila.user_id)}
                    </td>
                    <td className="px-4 py-3 font-bold text-brand-700">
                      +{fila.creditos}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-800">
                      {fila.referencia}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {fila.nota || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {formatDate(fila.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${estilos[fila.estado]}`}>{fila.estado}</span>
                    </td>
                    <td className="px-4 py-3">
                      {fila.estado === 'pendiente' ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            className="btn-ghost px-2.5 py-1.5 text-xs text-emerald-700"
                            onClick={() => handleAprobar(fila)}
                            disabled={procesando === fila.id}
                            title="Aprobar y acreditar créditos"
                          >
                            <Check className="h-3.5 w-3.5" /> Aprobar
                          </button>
                          <button
                            type="button"
                            className="btn-ghost px-2.5 py-1.5 text-xs text-red-600"
                            onClick={() => {
                              setRechazando(fila)
                              setMotivo('')
                            }}
                            disabled={procesando === fila.id}
                            title="Rechazar"
                          >
                            <X className="h-3.5 w-3.5" /> Rechazar
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          {fila.revisada_at ? formatDate(fila.revisada_at) : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={Boolean(rechazando)}
        title="Rechazar recarga"
        onClose={() => setRechazando(null)}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setRechazando(null)}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={handleRechazar}
              disabled={procesando === rechazando?.id}
            >
              {procesando ? 'Rechazando…' : 'Sí, rechazar'}
            </button>
          </>
        }
      >
        <p className="mb-4 text-sm text-slate-600">
          La recarga de <strong>{rechazando?.creditos} créditos</strong> (
          <code className="font-mono">{rechazando?.referencia}</code>) no se acreditará.
        </p>
        <Field label="Motivo (opcional)">
          <input
            className="input"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ejemplo: no encontré la transferencia con esa referencia"
          />
        </Field>
      </Modal>
    </div>
  )
}
