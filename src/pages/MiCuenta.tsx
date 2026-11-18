import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Clipboard, Coins, QrCode, RefreshCw } from 'lucide-react'
import { ErrorAlert, EstadoBadge, Field, Modal, Spinner } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useBranding } from '../context/BrandingContext'
import {
  getMiPerfil,
  getMovimientos,
  getOrdenes,
  getRecargas,
  getSaldo,
  solicitarRecarga,
} from '../lib/data'
import { formatDate, formatPrice } from '../lib/format'
import {
  MONTOS_RECARGA,
  type MovimientoCredito,
  type OrdenConDetalle,
  type Perfil,
  type Recarga,
} from '../types'

export default function MiCuenta() {
  const { user } = useAuth()
  const { branding } = useBranding()

  const [saldo, setSaldo] = useState(0)
  const [movimientos, setMovimientos] = useState<MovimientoCredito[]>([])
  const [compras, setCompras] = useState<OrdenConDetalle[]>([])
  const [recargas, setRecargas] = useState<Recarga[]>([])
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [monto, setMonto] = useState<number>(20)
  const [nota, setNota] = useState('')
  const [recargaActual, setRecargaActual] = useState<Recarga | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [copiado, setCopiado] = useState(false)

  function cargar() {
    if (!user) return
    setLoading(true)
    Promise.all([
      getSaldo(user.id),
      getMovimientos(user.id),
      getOrdenes(),
      getRecargas(user.id),
      getMiPerfil(user.id),
    ])
      .then(([s, m, o, r, p]) => {
        setSaldo(s)
        setMovimientos(m)
        setCompras(o)
        setRecargas(r)
        setPerfil(p)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(cargar, [user?.id])

  async function handleSolicitar() {
    if (!user) return
    setEnviando(true)
    setError('')
    try {
      const fila = await solicitarRecarga(monto, nota.trim(), user.id)
      setRecargaActual(fila)
      setRecargas((prev) => [fila, ...prev])
      setNota('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la solicitud.')
    } finally {
      setEnviando(false)
    }
  }

  function cerrarModal() {
    setModalOpen(false)
    setRecargaActual(null)
    setCopiado(false)
  }

  async function copiarReferencia() {
    if (!recargaActual) return
    try {
      await navigator.clipboard.writeText(recargaActual.referencia)
      setCopiado(true)
    } catch {
      setError('No se pudo copiar. Seleccioná el texto y copialo a mano.')
    }
  }

  const pendiente = recargas.find((r) => r.estado === 'pendiente')

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            <Coins className="h-7 w-7 text-brand-600" /> Mi cuenta
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Hola{perfil?.nombre ? `, ${perfil.nombre}` : ''}. Acá ves tu saldo, tus movimientos y tus
            compras.
          </p>
        </div>
        <button type="button" className="btn-ghost" onClick={cargar} disabled={loading}>
          <RefreshCw className="h-4 w-4" /> Actualizar
        </button>
      </div>

      {error && <div className="mb-4"><ErrorAlert message={error} /></div>}

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-brand-700 p-6 text-white shadow-sm">
              <p className="text-sm text-brand-100">Saldo disponible</p>
              <p className="mt-1 text-4xl font-extrabold">{saldo}</p>
              <p className="mt-1 text-xs text-brand-100">1 crédito = 1 USD</p>
              <button
                type="button"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                onClick={() => {
                  setRecargaActual(null)
                  setModalOpen(true)
                }}
              >
                <QrCode className="h-4 w-4" /> Recargar créditos
              </button>
            </div>
            <div className="card p-6">
              <p className="text-sm font-semibold text-slate-500">Mis datos</p>
              <p className="mt-2 text-sm text-slate-800">{perfil?.nombre || '—'}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
              {perfil?.telefono && (
                <p className="mt-1 text-sm text-slate-500">Teléfono: {perfil.telefono}</p>
              )}
              <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                Para pagar un servicio, buscalo en el{' '}
                <Link to="/" className="font-semibold text-brand-600 hover:underline">
                  catálogo
                </Link>{' '}
                y tocá «Comprar con créditos».
              </p>
            </div>
          </div>

          {pendiente && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">Tenés una recarga esperando confirmación</p>
              <p className="mt-1">
                {pendiente.creditos} créditos · Referencia{' '}
                <strong className="font-mono">{pendiente.referencia}</strong>
              </p>
              <button
                type="button"
                className="mt-2 font-semibold text-amber-800 underline"
                onClick={() => {
                  setRecargaActual(pendiente)
                  setModalOpen(true)
                }}
              >
                Ver datos para transferir
              </button>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="card overflow-hidden">
              <h2 className="border-b border-slate-200 px-5 py-3 text-base font-bold text-slate-900">
                Historial de créditos
              </h2>
              {movimientos.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-500">
                  Todavía no tenés movimientos.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {movimientos.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{m.descripcion}</p>
                        <p className="text-xs text-slate-400">{formatDate(m.created_at)}</p>
                      </div>
                      <span
                        className={`whitespace-nowrap text-sm font-bold ${
                          m.creditos > 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {m.creditos > 0 ? '+' : ''}
                        {m.creditos}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card overflow-hidden">
              <h2 className="border-b border-slate-200 px-5 py-3 text-base font-bold text-slate-900">
                Mis compras
              </h2>
              {compras.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-500">
                  Todavía no hiciste ninguna compra.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {compras.map((orden) => (
                    <li key={orden.id} className="px-5 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-800">
                          {orden.producto?.nombre ?? orden.codigo}
                        </p>
                        <EstadoBadge estado={orden.estado} />
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {orden.codigo} · {formatDate(orden.created_at)} ·{' '}
                        {formatPrice(orden.precio)}
                        {orden.creditos_usados > 0 && ` · ${orden.creditos_usados} créditos`}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}

      <Modal
        open={modalOpen}
        title={recargaActual ? 'Transferí por Binance Pay' : 'Recargar créditos'}
        onClose={cerrarModal}
        footer={
          recargaActual ? (
            <button type="button" className="btn-primary" onClick={cerrarModal}>
              Entendido
            </button>
          ) : undefined
        }
      >
        {recargaActual ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-emerald-50 p-4 text-center">
              <p className="text-sm text-emerald-800">Transferí exactamente</p>
              <p className="text-3xl font-extrabold text-emerald-900">
                US$ {recargaActual.creditos}
              </p>
              <p className="text-xs text-emerald-700">
                = {recargaActual.creditos} créditos
              </p>
            </div>

            {branding.binance_qr_url && (
              <div className="mx-auto w-fit rounded-xl border border-slate-200 bg-white p-3">
                <img
                  src={branding.binance_qr_url}
                  alt="QR de Binance Pay"
                  className="mx-auto h-56 w-56 object-contain"
                />
                <p className="mt-2 text-center text-xs text-slate-500">
                  Escaneá este QR desde la app de Binance
                </p>
              </div>
            )}

            <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                Referencia (obligatoria)
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 select-all rounded-lg bg-white px-3 py-2 text-lg font-bold tracking-wider text-slate-900">
                  {recargaActual.referencia}
                </code>
                <button type="button" className="btn-ghost" onClick={copiarReferencia}>
                  {copiado ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  {copiado ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {branding.binance_nota ||
                  'Poné esta referencia en el campo "Nota" o "Referencia" de la transferencia.'}
              </p>
              {branding.binance_pay_id && (
                <p className="mt-2 text-xs text-slate-600">
                  Binance Pay ID: <strong>{branding.binance_pay_id}</strong>
                </p>
              )}
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
              Después de transferir, tocá «Entendido». Tu saldo se acredita cuando yo confirme el
              pago. No hace falta subir ningún comprobante.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Field label="Elegí cuánto querés cargar" hint="1 crédito = 1 USD.">
              <div className="grid grid-cols-3 gap-2">
                {MONTOS_RECARGA.map((valor) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => setMonto(valor)}
                    className={`rounded-lg border px-3 py-3 text-sm font-bold transition ${
                      monto === valor
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-slate-200 text-slate-600 hover:border-brand-300'
                    }`}
                  >
                    {valor}
                    <span className="block text-[11px] font-normal">créditos</span>
                  </button>
                ))}
              </div>
            </Field>
            <Field
              label="Nota para el administrador (opcional)"
              hint="Por ejemplo, tu nombre de usuario de Binance, para identificar el pago más rápido."
            >
              <input
                className="input"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Ejemplo: pago de Juan Pérez"
              />
            </Field>
            <button
              type="button"
              className="btn-primary w-full"
              onClick={handleSolicitar}
              disabled={enviando}
            >
              {enviando ? 'Generando referencia…' : `Continuar con ${monto} créditos`}
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
