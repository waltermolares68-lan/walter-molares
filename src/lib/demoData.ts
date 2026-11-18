import type { Cliente, Orden, Producto } from '../types'

/**
 * Datos genéricos para el modo demostración (sin Supabase).
 * No representan clientes, precios ni compras reales.
 */
export const demoProductos: Producto[] = [
  {
    id: 'demo-p1',
    codigo: 'SRV-001',
    nombre: 'Reparación de pantalla (demo)',
    categoria: 'Reparación',
    descripcion: 'Servicio de ejemplo: reemplazo de pantalla.',
    precio: 85000,
    creditos: 20,
    imagen_url:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    activo: true,
    created_at: '2026-11-01T10:00:00.000Z',
  },
  {
    id: 'demo-p2',
    codigo: 'SRV-002',
    nombre: 'Cambio de batería (demo)',
    categoria: 'Reparación',
    descripcion: 'Servicio de ejemplo: reemplazo de batería.',
    precio: 45000,
    creditos: 10,
    imagen_url:
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
    activo: true,
    created_at: '2026-11-01T10:01:00.000Z',
  },
  {
    id: 'demo-p3',
    codigo: 'ACC-003',
    nombre: 'Funda protectora (demo)',
    categoria: 'Accesorio',
    descripcion: 'Producto de ejemplo: funda universal.',
    precio: 12000,
    creditos: 0,
    imagen_url:
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80',
    activo: true,
    created_at: '2026-11-01T10:02:00.000Z',
  },
  {
    id: 'demo-p4',
    codigo: 'REP-004',
    nombre: 'Repuesto genérico (demo)',
    categoria: 'Repuesto',
    descripcion: 'Repuesto de ejemplo sin marca ni modelo específico.',
    precio: 22000,
    creditos: 5,
    imagen_url:
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
    activo: false,
    created_at: '2026-11-01T10:03:00.000Z',
  },
]

export const demoClientes: Cliente[] = [
  {
    id: 'demo-c1',
    nombre: 'Cliente de ejemplo',
    telefono: '5490000000000',
    direccion: 'Dirección de ejemplo',
    notas: 'Registro de prueba, sin datos reales.',
    created_at: '2026-11-05T09:00:00.000Z',
  },
  {
    id: 'demo-c2',
    nombre: 'Cliente demo 2',
    telefono: '5490000000001',
    direccion: '',
    notas: 'Registro de prueba, sin datos reales.',
    created_at: '2026-11-06T09:00:00.000Z',
  },
]

export const demoOrdenes: Orden[] = [
  {
    id: 'demo-o1',
    codigo: 'ORD-0001',
    cliente_id: 'demo-c1',
    producto_id: 'demo-p1',
    estado: 'En reparación',
    precio: 85000,
    creditos_usados: 0,
    notas: 'Compra de ejemplo.',
    created_at: '2026-11-10T10:00:00.000Z',
    updated_at: '2026-11-10T10:00:00.000Z',
  },
  {
    id: 'demo-o2',
    codigo: 'ORD-0002',
    cliente_id: 'demo-c2',
    producto_id: 'demo-p2',
    estado: 'Listo',
    precio: 45000,
    creditos_usados: 0,
    notas: 'Compra de ejemplo.',
    created_at: '2026-11-11T11:00:00.000Z',
    updated_at: '2026-11-11T11:00:00.000Z',
  },
  {
    id: 'demo-o3',
    codigo: 'ORD-0003',
    cliente_id: 'demo-c1',
    producto_id: 'demo-p3',
    estado: 'Entregado',
    precio: 12000,
    creditos_usados: 0,
    notas: 'Compra de ejemplo.',
    created_at: '2026-11-12T12:00:00.000Z',
    updated_at: '2026-11-12T12:00:00.000Z',
  },
]
