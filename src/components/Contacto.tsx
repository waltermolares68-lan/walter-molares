import { Clock, Facebook, Instagram, MapPin, Music2, Youtube, type LucideIcon } from 'lucide-react'
import { useBranding } from '../context/BrandingContext'
import { useWhatsapp } from '../hooks/useWhatsapp'
import { WhatsAppLink } from './ui'

export interface SocialLink {
  label: string
  href: string
  icon: LucideIcon
}

function withProtocol(value: string, base: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `${base}${trimmed.replace(/^@/, '')}`
}

export function useSocialLinks(): SocialLink[] {
  const { branding } = useBranding()

  return [
    { label: 'Instagram', href: withProtocol(branding.instagram, 'https://instagram.com/'), icon: Instagram },
    { label: 'Facebook', href: withProtocol(branding.facebook, 'https://facebook.com/'), icon: Facebook },
    { label: 'TikTok', href: withProtocol(branding.tiktok, 'https://tiktok.com/@'), icon: Music2 },
    { label: 'YouTube', href: withProtocol(branding.youtube, 'https://youtube.com/'), icon: Youtube },
  ].filter((link) => link.href)
}

export function Contacto() {
  const { branding } = useBranding()
  const wa = useWhatsapp()
  const redes = useSocialLinks()
  const mapaHref = branding.mapa_url
    ? /^https?:\/\//i.test(branding.mapa_url)
      ? branding.mapa_url
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branding.mapa_url)}`
    : ''

  const tieneInfo = redes.length > 0 || Boolean(branding.direccion || branding.horario || mapaHref)
  if (!tieneInfo) return null

  return (
    <section id="contacto" className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Contacto y redes</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Escribinos por WhatsApp o seguinos en nuestras redes.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <WhatsAppLink href={wa.general()} label="Escribinos por WhatsApp" />
          </div>
          {redes.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {redes.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  <Icon className="h-4 w-4" /> {label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-slate-900">Ubicación</h2>
          {branding.direccion && (
            <p className="flex items-start gap-2 text-sm text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              {branding.direccion}
            </p>
          )}
          {branding.horario && (
            <p className="flex items-start gap-2 text-sm text-slate-600">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              {branding.horario}
            </p>
          )}
          {mapaHref && (
            <a
              href={mapaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
            >
              <MapPin className="h-4 w-4" /> Cómo llegar
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
