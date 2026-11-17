import { useEffect, useState, type FormEvent } from 'react'
import { Facebook, Instagram, Music2, Palette, Youtube } from 'lucide-react'
import { ImageUpload } from '../components/ImageUpload'
import { ErrorAlert, Field } from '../components/ui'
import { useBranding } from '../context/BrandingContext'
import { saveBranding } from '../lib/data'
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
          Cambiá el logo, el WhatsApp, las redes y la ubicación. Todo se refleja en el sitio al
          instante, sin volver a publicar.
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
        <div className="h-40 bg-brand-700">
          {banner ? (
            <img src={banner} alt="Presentación" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-brand-100">
              Imagen de presentación (pendiente de cargar)
            </div>
          )}
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
            label="Imagen horizontal de presentación"
            value={banner}
            onChange={setBanner}
            folder="marca"
            hint="Recomendado: imagen ancha (por ejemplo 1200 x 400 px). Se muestra en el encabezado del catálogo."
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

        <div className="flex justify-end border-t border-slate-200 pt-4">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
