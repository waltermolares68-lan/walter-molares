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
