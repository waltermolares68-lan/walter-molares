import { supabase } from './supabase'
import { demoClientes, demoOrdenes, demoProductos } from './demoData'
import type { Cliente, Orden, OrdenConDetalle, Producto } from '../types'

const KEY = {
  productos: 'stwm.productos.v1',
  clientes: 'stwm.clientes.v1',
  ordenes: 'stwm.ordenes.v1',
}

function readLocal<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed))
      return seed.map((item) => ({ ...item }))
    }
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : seed.map((item) => ({ ...item }))
  } catch {
    return seed.map((item) => ({ ...item }))
  }
}

function writeLocal<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function uid(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
  )
}

function toNumber(value: unknown): number {
  return Number(value ?? 0)
}

// ----------------------------- Productos -----------------------------

export type ProductoInput = Omit<Producto, 'id' | 'created_at'>

export async function getProductos(includeInactive = true): Promise<Producto[]> {
  if (supabase) {
    let query = supabase.from('productos').select('*').order('codigo', { ascending: true })
    if (!includeInactive) query = query.eq('activo', true)
    const { data, error } = await query
    if (error) throw error
    return (data ?? []).map((row) => {
      const item = row as Producto
      return { ...item, precio: toNumber(item.precio) }
    })
  }

  const all = readLocal<Producto>(KEY.productos, demoProductos)
  return (includeInactive ? all : all.filter((p) => p.activo)).sort((a, b) =>
    a.codigo.localeCompare(b.codigo),
  )
}

export async function createProducto(input: ProductoInput): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('productos').insert(input)
    if (error) throw error
    return
  }
  const all = readLocal<Producto>(KEY.productos, demoProductos)
  all.push({ ...input, id: uid(), created_at: new Date().toISOString() })
  writeLocal(KEY.productos, all)
}

export async function updateProducto(id: string, input: Partial<ProductoInput>): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('productos').update(input).eq('id', id)
    if (error) throw error
    return
  }
  const all = readLocal<Producto>(KEY.productos, demoProductos)
  writeLocal(KEY.productos, all.map((p) => (p.id === id ? { ...p, ...input } : p)))
}

export async function deleteProducto(id: string): Promise<void> {
  const ordenes = await getOrdenes()
  if (ordenes.some((o) => o.producto_id === id)) {
    throw new Error('No se puede eliminar: hay compras asociadas. Desactívalo en su lugar.')
  }
  if (supabase) {
    const { error } = await supabase.from('productos').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeLocal(
    KEY.productos,
    readLocal<Producto>(KEY.productos, demoProductos).filter((p) => p.id !== id),
  )
}

// ------------------------------ Clientes ------------------------------

export type ClienteInput = Omit<Cliente, 'id' | 'created_at'>

export async function getClientes(): Promise<Cliente[]> {
  if (supabase) {
    const { data, error } = await supabase.from('clientes').select('*').order('nombre')
    if (error) throw error
    return (data ?? []) as Cliente[]
  }
  return readLocal<Cliente>(KEY.clientes, demoClientes).sort((a, b) =>
    a.nombre.localeCompare(b.nombre),
  )
}

export async function createCliente(input: ClienteInput): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('clientes').insert(input)
    if (error) throw error
    return
  }
  const all = readLocal<Cliente>(KEY.clientes, demoClientes)
  all.push({ ...input, id: uid(), created_at: new Date().toISOString() })
  writeLocal(KEY.clientes, all)
}

export async function updateCliente(id: string, input: Partial<ClienteInput>): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('clientes').update(input).eq('id', id)
    if (error) throw error
    return
  }
  const all = readLocal<Cliente>(KEY.clientes, demoClientes)
  writeLocal(KEY.clientes, all.map((c) => (c.id === id ? { ...c, ...input } : c)))
}

export async function deleteCliente(id: string): Promise<void> {
  const ordenes = await getOrdenes()
  if (ordenes.some((o) => o.cliente_id === id)) {
    throw new Error('No se puede eliminar: el cliente tiene compras asociadas.')
  }
  if (supabase) {
    const { error } = await supabase.from('clientes').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeLocal(
    KEY.clientes,
    readLocal<Cliente>(KEY.clientes, demoClientes).filter((c) => c.id !== id),
  )
}

// ------------------------------- Órdenes ------------------------------

export type OrdenInput = Omit<Orden, 'id' | 'codigo' | 'created_at' | 'updated_at'>

export async function getOrdenes(): Promise<OrdenConDetalle[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('ordenes')
      .select('*, cliente:clientes(*), producto:productos(*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((row) => {
      const item = row as OrdenConDetalle & { cliente: unknown; producto: unknown }
      return {
        ...item,
        precio: toNumber(item.precio),
        cliente: Array.isArray(item.cliente)
          ? (item.cliente[0] as Cliente | undefined)
          : (item.cliente as Cliente | undefined),
        producto: Array.isArray(item.producto)
          ? (item.producto[0] as Producto | undefined)
          : (item.producto as Producto | undefined),
      }
    })
  }

  const ordenes = readLocal<Orden>(KEY.ordenes, demoOrdenes)
  const clientes = readLocal<Cliente>(KEY.clientes, demoClientes)
  const productos = readLocal<Producto>(KEY.productos, demoProductos)
  return ordenes
    .map((o) => ({
      ...o,
      cliente: clientes.find((c) => c.id === o.cliente_id),
      producto: productos.find((p) => p.id === o.producto_id),
    }))
    .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
}

async function nextOrdenCodigo(): Promise<string> {
  const ordenes = await getOrdenes()
  const numeros = ordenes
    .map((o) => Number(o.codigo.replace(/\D/g, '')))
    .filter((n) => Number.isFinite(n))
  const siguiente = (numeros.length ? Math.max(...numeros) : 0) + 1
  return `ORD-${String(siguiente).padStart(4, '0')}`
}

export async function createOrden(input: OrdenInput): Promise<OrdenConDetalle> {
  const codigo = await nextOrdenCodigo()
  const now = new Date().toISOString()

  if (supabase) {
    const { data, error } = await supabase
      .from('ordenes')
      .insert({ ...input, codigo })
      .select('*')
      .single()
    if (error) throw error
    return { ...(data as Orden), cliente: undefined, producto: undefined }
  }

  const all = readLocal<Orden>(KEY.ordenes, demoOrdenes)
  const creada: Orden = { ...input, codigo, id: uid(), created_at: now, updated_at: now }
  all.push(creada)
  writeLocal(KEY.ordenes, all)
  return { ...creada, cliente: undefined, producto: undefined }
}

export async function updateOrden(id: string, input: Partial<OrdenInput>): Promise<void> {
  if (supabase) {
    const { error } = await supabase
      .from('ordenes')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    return
  }
  const all = readLocal<Orden>(KEY.ordenes, demoOrdenes)
  writeLocal(
    KEY.ordenes,
    all.map((o) =>
      o.id === id ? { ...o, ...input, updated_at: new Date().toISOString() } : o,
    ),
  )
}

export async function deleteOrden(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('ordenes').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeLocal(
    KEY.ordenes,
    readLocal<Orden>(KEY.ordenes, demoOrdenes).filter((o) => o.id !== id),
  )
}
