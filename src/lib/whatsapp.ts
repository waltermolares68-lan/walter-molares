import type { OrdenConDetalle, Producto } from '../types'
import { formatPrice } from './format'

const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '5491135834902'

/** Número por defecto del build; el panel puede sobrescribirlo desde Supabase. */
export const whatsappNumber = String(rawNumber).replace(/\D/g, '')

function buildLink(message: string, phone: string): string {
  const digits = String(phone || whatsappNumber).replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function whatsappGeneral(phone: string = whatsappNumber): string {
  return buildLink('Hola! Quisiera hacer una consulta sobre sus servicios. Gracias.', phone)
}

export function whatsappProducto(
  producto: Producto,
  phone: string = whatsappNumber,
): string {
  return buildLink(
    `Hola! Quisiera consultar por *${producto.nombre}* (${producto.codigo}). ` +
      `Precio: ${formatPrice(producto.precio)}. ¿Podrían ayudarme?`,
    phone,
  )
}

export function whatsappOrden(
  orden: OrdenConDetalle,
  phone: string = whatsappNumber,
): string {
  const nombre = orden.producto?.nombre ?? 'Servicio'
  const codigoProducto = orden.producto?.codigo ?? '—'
  return buildLink(
    `Hola! Consulta sobre mi compra *${orden.codigo}*: ${nombre} (${codigoProducto}). ` +
      `Precio: ${formatPrice(orden.precio)}. Estado: ${orden.estado}. Gracias!`,
    phone,
  )
}
