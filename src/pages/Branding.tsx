import { useEffect, useState, type FormEvent } from 'react'
import { Palette } from 'lucide-react'
import { ImageUpload } from '../components/ImageUpload'
import { ErrorAlert } from '../components/ui'
import { useBranding } from '../context/BrandingContext'
import { saveBranding } from '../lib/data'

export default function Branding() {
  const { branding, refresh } = useBranding()
  const [logo, setLogo] = useState(branding.logo_url)
  const [banner, setBanner] = useState(branding.banner_url)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setLogo(branding.logo_url)
    setBanner(branding.banner_url)
  }, [branding.logo_url, branding.banner_url])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    setSaving(true)
    try {
      await saveBranding({ logo_url: logo, banner_url: banner })
      await refresh()
      setNotice('Marca e imagen de presentación actualizadas correctamente.')
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
          Cambiá el logo del sitio y la imagen horizontal de presentación. Los cambios se ven en
          todo el sitio, sin volver a publicar.
        </p>
      </div>

      <div className="card mb-6 overflow-hidden">
        <p className="border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Vista previa
        </p>
        <div className="flex items-center gap-2.5 bg-white px-5 py-3">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-brand-600 text-white">
            {logo ? (
              <img src={logo} alt="Logo" className="h-full w-full object-contain" />
            ) : (
              <Palette className="h-5 w-5" />
            )}
          </span>
          <span className="text-sm font-bold text-slate-900">Servicio Tecnico Walter Molares</span>
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

      <form onSubmit={handleSubmit} className="card space-y-6 p-5 sm:p-6">
        {notice && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">{notice}</div>
        )}
        {error && <ErrorAlert message={error} />}

        <ImageUpload
          label="Logo de tu marca"
          value={logo}
          onChange={setLogo}
          folder="marca"
          hint="Recomendado: imagen cuadrada PNG con fondo transparente. Se muestra en el menú del sitio."
          previewClass="h-24 w-24 object-contain"
        />

        <ImageUpload
          label="Imagen horizontal de presentación"
          value={banner}
          onChange={setBanner}
          folder="marca"
          hint="Recomendado: imagen ancha (por ejemplo 1200 x 400 px). Se muestra en el encabezado del catálogo."
          previewClass="h-40 w-full object-cover"
        />

        <div className="flex justify-end border-t border-slate-200 pt-4">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar marca'}
          </button>
        </div>
      </form>
    </div>
  )
}
