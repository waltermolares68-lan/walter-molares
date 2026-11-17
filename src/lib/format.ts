const currency = import.meta.env.VITE_CURRENCY || 'ARS'
const locale = import.meta.env.VITE_LOCALE || 'es-AR'

export function formatPrice(value: number): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(value) || 0)
}

export function formatDate(value?: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
}
