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

export interface Producto {
  id: string
  codigo: string
  nombre: string
  categoria: Categoria
  descripcion: string
  precio: number
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
  created_at?: string
}

export interface Orden {
  id: string
  codigo: string
  cliente_id: string
  producto_id: string
  estado: EstadoOrden
  precio: number
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
>
