import { useBranding } from '../context/BrandingContext'
import {
  whatsappGeneral,
  whatsappNumber,
  whatsappOrden,
  whatsappProducto,
} from '../lib/whatsapp'
import type { OrdenConDetalle, Producto } from '../types'

/** Enlaces de WhatsApp con el número que el administrador cargó en el panel. */
export function useWhatsapp() {
  const { branding } = useBranding()
  const phone = branding.whatsapp || whatsappNumber

  return {
    phone,
    general: () => whatsappGeneral(phone),
    producto: (producto: Producto) => whatsappProducto(producto, phone),
    orden: (orden: OrdenConDetalle) => whatsappOrden(orden, phone),
  }
}
