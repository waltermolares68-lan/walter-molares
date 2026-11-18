export type Categoria = 'Reparación' | 'Repuesto' | 'Accesorio' | 'Otro'

export type EstadoOrden =
  | 'Recibido'
  | 'Diagnóstico'
  | 'En reparación'
  | 'Listo'
  | 'Entregado'
  | 'Cancelado'

export const CATEGORIAS: Categoria[] = ['Reparación', 'Repuesto', 'Accesorio', 'Otro']

export const ESTADOS: EstadoOrden[] = [
  'Recibido',
  'Diagnóstico',
  'En reparación',
  'Listo',
  'Entregado',
  'Cancelado',
]

/** 1 crédito = 1 USD. Montos únicos permitidos para recargar. */
export const MONTOS_RECARGA = [10, 20, 30, 40, 50, 100] as const

export type AppRole = 'admin' | 'cliente'
export type EstadoRecarga = 'pendiente' | 'aprobada' | 'rechazada'

export interface Perfil {
  id: string
  role: AppRole
  nombre: string
  telefono: string
  created_at?: string
}

export interface Recarga {
  id: string
  user_id: string
  creditos: number
  referencia: string
  estado: EstadoRecarga
  nota: string
  comprobante_url: string
  created_at?: string
  revisada_at?: string | null
  revisada_por?: string | null
}

export interface MovimientoCredito {
  id: string
  user_id: string
  tipo: 'recarga' | 'compra' | 'ajuste'
  creditos: number
  descripcion: string
  recarga_id?: string | null
  orden_id?: string | null
  created_at?: string
}

export interface Producto {
  id: string
  codigo: string
  nombre: string
  categoria: Categoria
  descripcion: string
  precio: number
  /** Costo en créditos. 0 = solo se consulta por WhatsApp. */
  creditos: number
  imagen_url: string
  activo: boolean
  created_at?: string
}

export interface Cliente {
  id: string
  nombre: string
  telefono: string
  direccion: string
  notas: string
  user_id?: string | null
  created_at?: string
}

export interface Orden {
  id: string
  codigo: string
  cliente_id: string
  producto_id: string
  estado: EstadoOrden
  precio: number
  creditos_usados: number
  notas: string
  created_at?: string
  updated_at?: string
}

export interface OrdenConDetalle extends Orden {
  cliente?: Cliente
  producto?: Producto
}

export interface Branding {
  id: boolean
  logo_url: string
  banner_url: string
  whatsapp: string
  instagram: string
  facebook: string
  tiktok: string
  youtube: string
  direccion: string
  mapa_url: string
  horario: string
  hero_etiqueta: string
  hero_titulo: string
  hero_descripcion: string
  hero_boton_servicios: string
  hero_boton_whatsapp: string
  servicios_titulo: string
  servicios_descripcion: string
  binance_pay_id: string
  binance_qr_url: string
  binance_nota: string
  updated_at?: string
}

export type BrandingInput = Pick<
  Branding,
  | 'logo_url'
  | 'banner_url'
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'direccion'
  | 'mapa_url'
  | 'horario'
  | 'hero_etiqueta'
  | 'hero_titulo'
  | 'hero_descripcion'
  | 'hero_boton_servicios'
  | 'hero_boton_whatsapp'
  | 'servicios_titulo'
  | 'servicios_descripcion'
  | 'binance_pay_id'
  | 'binance_qr_url'
  | 'binance_nota'
>
