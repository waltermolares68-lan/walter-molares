import type { OrdenConDetalle, Producto } from '../types'
import { formatPrice } from './format'

const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '5491135834902'
export const whatsappNumber = String(rawNumber).replace(/\D/g, '')

function buildLink(message: string): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}

/** Enlace genérico para el botón flotante del catálogo. */
export function whatsappGeneral(): string {
  return buildLink('Hola! Quisiera hacer una consulta sobre sus servicios. Gracias.')
}

/** Enlace desde una tarjeta del catálogo: incluye código y precio del servicio. */
export function whatsappProducto(producto: Producto): string {
  return buildLink(
    `Hola! Quisiera consultar por *${producto.nombre}* (${producto.codigo}). ` +
      `Precio: ${formatPrice(producto.precio)}. ¿Podrían ayudarme?`,
  )
}

/** Enlace desde una compra/orden: incluye código de compra, producto y precio. */
export function whatsappOrden(orden: OrdenConDetalle): string {
  const nombre = orden.producto?.nombre ?? 'Servicio'
  const codigoProducto = orden.producto?.codigo ?? '—'
  return buildLink(
    `Hola! Consulta sobre mi compra *${orden.codigo}*: ${nombre} (${codigoProducto}). ` +
      `Precio: ${formatPrice(orden.precio)}. Estado: ${orden.estado}. Gracias!`,
  )
}
