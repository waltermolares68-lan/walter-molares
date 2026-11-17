import { supabase } from './supabase'
import { demoClientes, demoOrdenes, demoProductos } from './demoData'
import type { Branding, BrandingInput, Cliente, Orden, OrdenConDetalle, Producto } from '../types'

const KEY = {
  productos: 'stwm.productos.v1',
  clientes: 'stwm.clientes.v1',
  ordenes: 'stwm.ordenes.v1',
  branding: 'stwm.branding.v1',
}

const STORAGE_BUCKET = 'imagenes'

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

// ------------------------------ Marca / branding -----------------------------

export const defaultBranding: Branding = {
  id: true,
  logo_url: '',
  banner_url: '',
  whatsapp: '5491135834902',
  instagram: '',
  facebook: '',
  tiktok: '',
  youtube: '',
  direccion: '',
  mapa_url: '',
  horario: '',
}

export async function getBranding(): Promise<Branding> {
  if (supabase) {
    const { data, error } = await supabase
      .from('branding')
      .select('*')
      .eq('id', true)
      .maybeSingle()
    if (error) throw error
    // Se mezclan los valores por defecto por si la fila aún no tiene las columnas nuevas.
    return data ? { ...defaultBranding, ...(data as Partial<Branding>) } : defaultBranding
  }

  try {
    const raw = localStorage.getItem(KEY.branding)
    return raw ? { ...defaultBranding, ...(JSON.parse(raw) as Partial<Branding>) } : defaultBranding
  } catch {
    return defaultBranding
  }
}

export async function saveBranding(input: BrandingInput): Promise<void> {
  const now = new Date().toISOString()
  if (supabase) {
    const { error } = await supabase
      .from('branding')
      .upsert({ id: true, ...input, updated_at: now })
    if (error) {
      // Si la tabla es de una versión anterior, el error de columnas se traduce a una acción concreta.
      if (/column|schema cache|pgrst204/i.test(error.message ?? '')) {
        throw new Error(
          'Falta actualizar la base de datos: ejecutá supabase/schema.sql en Supabase (SQL Editor) y volvé a intentar.',
        )
      }
      throw error
    }
    return
  }
  localStorage.setItem(KEY.branding, JSON.stringify({ id: true, ...input, updated_at: now }))
}

/** Sube una imagen a Supabase Storage. En modo demo devuelve un data URL local. */
export async function uploadImage(
  file: File,
  folder: 'productos' | 'marca',
): Promise<string> {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('La imagen debe pesar menos de 5 MB.')
  }

  if (supabase) {
    const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false })
    if (error) throw error
    return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl
  }

  if (file.size > 1.5 * 1024 * 1024) {
    throw new Error('En modo demo la imagen debe pesar menos de 1,5 MB.')
  }
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    reader.readAsDataURL(file)
  })
}
