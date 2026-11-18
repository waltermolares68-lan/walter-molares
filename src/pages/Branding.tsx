import { useEffect, useState, type FormEvent } from 'react'
import { Facebook, Instagram, Music2, Palette, QrCode, Youtube } from 'lucide-react'
import { ImageUpload } from '../components/ImageUpload'
import { ErrorAlert, Field } from '../components/ui'
import { useBranding } from '../context/BrandingContext'
import { defaultBranding, saveBranding } from '../lib/data'
import { whatsappGeneral } from '../lib/whatsapp'
import type { BrandingInput } from '../types'

const redesPreview = [
  { label: 'Instagram', Icon: Instagram, key: 'instagram' },
  { label: 'Facebook', Icon: Facebook, key: 'facebook' },
  { label: 'TikTok', Icon: Music2, key: 'tiktok' },
  { label: 'YouTube', Icon: Youtube, key: 'youtube' },
] as const

export default function Branding() {
  const { branding, refresh } = useBranding()
  const [logo, setLogo] = useState(branding.logo_url)
  const [banner, setBanner] = useState(branding.banner_url)
  const [whatsapp, setWhatsapp] = useState(branding.whatsapp)
  const [instagram, setInstagram] = useState(branding.instagram)
  const [facebook, setFacebook] = useState(branding.facebook)
  const [tiktok, setTiktok] = useState(branding.tiktok)
  const [youtube, setYoutube] = useState(branding.youtube)
  const [direccion, setDireccion] = useState(branding.direccion)
  const [mapaUrl, setMapaUrl] = useState(branding.mapa_url)
  const [horario, setHorario] = useState(branding.horario)
  const [heroEtiqueta, setHeroEtiqueta] = useState(branding.hero_etiqueta || defaultBranding.hero_etiqueta)
  const [heroTitulo, setHeroTitulo] = useState(branding.hero_titulo || defaultBranding.hero_titulo)
  const [heroDescripcion, setHeroDescripcion] = useState(branding.hero_descripcion || defaultBranding.hero_descripcion)
  const [heroBotonServicios, setHeroBotonServicios] = useState(branding.hero_boton_servicios || defaultBranding.hero_boton_servicios)
  const [heroBotonWhatsapp, setHeroBotonWhatsapp] = useState(branding.hero_boton_whatsapp || defaultBranding.hero_boton_whatsapp)
  const [serviciosTitulo, setServiciosTitulo] = useState(branding.servicios_titulo || defaultBranding.servicios_titulo)
  const [serviciosDescripcion, setServiciosDescripcion] = useState(branding.servicios_descripcion || defaultBranding.servicios_descripcion)
  const [binancePayId, setBinancePayId] = useState(branding.binance_pay_id || defaultBranding.binance_pay_id)
  const [binanceQrUrl, setBinanceQrUrl] = useState(branding.binance_qr_url || defaultBranding.binance_qr_url)
  const [binanceNota, setBinanceNota] = useState(branding.binance_nota || defaultBranding.binance_nota)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setLogo(branding.logo_url)
    setBanner(branding.banner_url)
    setWhatsapp(branding.whatsapp)
    setInstagram(branding.instagram)
    setFacebook(branding.facebook)
    setTiktok(branding.tiktok)
    setYoutube(branding.youtube)
    setDireccion(branding.direccion)
    setMapaUrl(branding.mapa_url)
    setHorario(branding.horario)
    setHeroEtiqueta(branding.hero_etiqueta || defaultBranding.hero_etiqueta)
    setHeroTitulo(branding.hero_titulo || defaultBranding.hero_titulo)
    setHeroDescripcion(branding.hero_descripcion || defaultBranding.hero_descripcion)
    setHeroBotonServicios(branding.hero_boton_servicios || defaultBranding.hero_boton_servicios)
    setHeroBotonWhatsapp(branding.hero_boton_whatsapp || defaultBranding.hero_boton_whatsapp)
    setServiciosTitulo(branding.servicios_titulo || defaultBranding.servicios_titulo)
    setServiciosDescripcion(branding.servicios_descripcion || defaultBranding.servicios_descripcion)
    setBinancePayId(branding.binance_pay_id || defaultBranding.binance_pay_id)
    setBinanceQrUrl(branding.binance_qr_url || defaultBranding.binance_qr_url)
    setBinanceNota(branding.binance_nota || defaultBranding.binance_nota)
  }, [branding])

  const whatsappDigits = whatsapp.replace(/\D/g, '')
  const redesActivas = redesPreview.filter(({ key }) => branding[key]?.trim())

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')

    const payload: BrandingInput = {
      logo_url: logo,
      banner_url: banner,
      whatsapp: whatsapp.replace(/\D/g, ''),
      instagram: instagram.trim(),
      facebook: facebook.trim(),
      tiktok: tiktok.trim(),
      youtube: youtube.trim(),
      direccion: direccion.trim(),
      mapa_url: mapaUrl.trim(),
      horario: horario.trim(),
      hero_etiqueta: heroEtiqueta.trim(),
      hero_titulo: heroTitulo.trim(),
      hero_descripcion: heroDescripcion.trim(),
      hero_boton_servicios: heroBotonServicios.trim(),
      hero_boton_whatsapp: heroBotonWhatsapp.trim(),
      servicios_titulo: serviciosTitulo.trim(),
      servicios_descripcion: serviciosDescripcion.trim(),
      binance_pay_id: binancePayId.trim(),
      binance_qr_url: binanceQrUrl,
      binance_nota: binanceNota.trim(),
    }

    if (!payload.whatsapp) {
      setError('Ingresá el número de WhatsApp con código de país (ejemplo: 5491135834902).')
      return
    }

    setSaving(true)
    try {
      await saveBranding(payload)
      await refresh()
      setNotice('Cambios guardados. Ya se ven en todo el sitio, sin volver a publicar.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          <Palette className="h-7 w-7 text-brand-600" /> Marca y presentación
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Cambiá el logo, los textos del inicio, el WhatsApp, las redes, la ubicación y el QR de
          Binance Pay. Todo se refleja en el sitio al instante, sin volver a publicar.
        </p>
      </div>

      <div className="card mb-6 overflow-hidden">
        <p className="border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Vista previa
        </p>
        <div className="flex flex-wrap items-center gap-2.5 bg-white px-5 py-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full">
            {logo ? (
              <img src={logo} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center rounded-full bg-brand-600 text-white">
                <Palette className="h-5 w-5" />
              </span>
            )}
          </span>
          <div className="mr-auto">
            <p className="text-sm font-bold text-slate-900">Servicio Tecnico Walter Molares</p>
            <p className="text-xs text-slate-500">WhatsApp: +{whatsappDigits || '…'}</p>
          </div>
          {redesActivas.map(({ label, Icon, key }) => (
            <span key={key} title={label} className="text-slate-400">
              <Icon className="h-4 w-4" />
            </span>
          ))}
        </div>
        <div className="bg-brand-700 p-3">
          <div className="relative mx-auto h-44 max-w-md overflow-hidden rounded-2xl bg-brand-600">
            {banner ? (
              <img src={banner} alt="Presentación" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-brand-100">
                Acá se ve la foto del teléfono que aparece arriba del catálogo (pendiente de cargar)
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-8 p-5 sm:p-6">
        {notice && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">{notice}</div>
        )}
        {error && <ErrorAlert message={error} />}

        <section className="space-y-5">
          <h2 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-900">
            Logo e imagen de presentación
          </h2>
          <ImageUpload
            label="Logo de tu marca"
            value={logo}
            onChange={setLogo}
            folder="marca"
            hint="Se muestra redondo, como una foto de perfil y sin borde. Usá una imagen cuadrada."
            previewClass="h-24 w-24 rounded-full object-cover"
          />
          <ImageUpload
            label="Imagen de presentación (la foto del teléfono que aparece arriba del catálogo)"
            value={banner}
            onChange={setBanner}
            folder="marca"
            hint="Esta es la foto grande del encabezado: la que ahora muestra un iPhone de ejemplo. Subí la tuya y reemplaza esa imagen. Si es ancha (por ejemplo 1200 x 400 px), se ve mejor."
            previewClass="h-40 w-full object-cover"
          />
        </section>

        <section className="space-y-4">
          <h2 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-900">
            WhatsApp
          </h2>
          <Field
            label="Número de WhatsApp"
            hint="Solo números, con código de país y sin el signo + (ejemplo: 5491135834902). Todos los botones «Consultar por WhatsApp» usarán este número."
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="input sm:max-w-xs"
                inputMode="numeric"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="5491135834902"
              />
              {whatsappDigits && (
                <a
                  href={whatsappGeneral(whatsappDigits)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost justify-center whitespace-nowrap"
                >
                  Probar número
                </a>
              )}
            </div>
          </Field>
        </section>

        <section className="space-y-4">
          <h2 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-900">
            Redes sociales
          </h2>
          <p className="text-xs text-slate-500">
            Dejá vacías las que no uses. Podés pegar el enlace completo o solo tu usuario.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Instagram" hint="Ejemplo: @waltermolares o el enlace completo.">
              <input className="input" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@tuusuario" />
            </Field>
            <Field label="Facebook" hint="Ejemplo: waltermolares o el enlace completo.">
              <input className="input" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="tu-pagina" />
            </Field>
            <Field label="TikTok" hint="Ejemplo: @tuusuario o el enlace completo.">
              <input className="input" value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="@tuusuario" />
            </Field>
            <Field label="YouTube" hint="Pegá el enlace de tu canal.">
              <input className="input" value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://youtube.com/..." />
            </Field>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-900">
            Ubicación y horario
          </h2>
          <Field label="Dirección">
            <input
              className="input"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ejemplo: Av. Rivadavia 1234, CABA"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Enlace al mapa" hint="Pegá el enlace de Google Maps o directamente la dirección.">
              <input
                className="input"
                value={mapaUrl}
                onChange={(e) => setMapaUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
              />
            </Field>
            <Field label="Horario de atención">
              <input
                className="input"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                placeholder="Ejemplo: Lunes a viernes, 9 a 18 h"
              />
            </Field>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-900">
            Textos de la pantalla de inicio
          </h2>
          <p className="text-xs text-slate-500">
            Estos son los textos que ve cualquiera al abrir la web. Si dejás un campo vacío, se usa
            el texto original.
          </p>
          <Field label="Etiqueta pequeña" hint="El texto que aparece arriba del título, al lado del icono de teléfono.">
            <input className="input" value={heroEtiqueta} onChange={(e) => setHeroEtiqueta(e.target.value)} />
          </Field>
          <Field label="Título principal" hint="El texto grande del encabezado.">
            <input className="input" value={heroTitulo} onChange={(e) => setHeroTitulo(e.target.value)} />
          </Field>
          <Field label="Descripción del encabezado" hint="El párrafo debajo del título. Podés usar enter para saltos de línea.">
            <textarea className="input min-h-[100px]" value={heroDescripcion} onChange={(e) => setHeroDescripcion(e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Texto del botón «Ver servicios»">
              <input className="input" value={heroBotonServicios} onChange={(e) => setHeroBotonServicios(e.target.value)} />
            </Field>
            <Field label="Texto del botón de WhatsApp">
              <input className="input" value={heroBotonWhatsapp} onChange={(e) => setHeroBotonWhatsapp(e.target.value)} />
            </Field>
          </div>
          <Field label="Título de la sección de servicios">
            <input className="input" value={serviciosTitulo} onChange={(e) => setServiciosTitulo(e.target.value)} />
          </Field>
          <Field label="Descripción de la sección de servicios">
            <textarea className="input min-h-[70px]" value={serviciosDescripcion} onChange={(e) => setServiciosDescripcion(e.target.value)} />
          </Field>
        </section>

        <section className="space-y-4">
          <h2 className="flex items-center gap-2 border-b border-slate-200 pb-2 text-base font-bold text-slate-900">
            <QrCode className="h-5 w-5 text-brand-600" /> Binance Pay (recargas)
          </h2>
          <p className="text-xs leading-5 text-slate-500">
            Los clientes van a ver este QR al recargar. Generá el código QR de tu Binance Pay desde
            la app de Binance → Recibir → Binance Pay → Compartir QR, guardalo en tu celular y
            subilo acá. Cada recarga genera una referencia única que el cliente pone como nota de la
            transferencia.
          </p>
          <ImageUpload
            label="QR de Binance Pay"
            value={binanceQrUrl}
            onChange={setBinanceQrUrl}
            folder="marca"
            hint="Subí una imagen cuadrada con tu código QR. Es la que verán los clientes al elegir «Recargar créditos»."
            previewClass="h-32 w-32 object-contain"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Binance Pay ID (opcional)" hint="Tu usuario o Pay ID, para que el cliente pueda buscarte.">
              <input
                className="input"
                value={binancePayId}
                onChange={(e) => setBinancePayId(e.target.value)}
                placeholder="Ejemplo: 123456789"
              />
            </Field>
            <Field label="Texto de ayuda (opcional)">
              <input
                className="input"
                value={binanceNota}
                onChange={(e) => setBinanceNota(e.target.value)}
                placeholder="Cómo poner la referencia en la transferencia"
              />
            </Field>
          </div>
          <div className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            <strong>Importante:</strong> configurá el QR antes de habilitar recargas. Después de que
            el cliente transfiera, aprobá la recarga en <strong>Panel → Recargas</strong> y los
            créditos se acreditan automáticamente.
          </div>
        </section>

        <div className="flex justify-end border-t border-slate-200 pt-4">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
