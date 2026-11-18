import { supabase } from './supabase'
import { demoClientes, demoOrdenes, demoProductos } from './demoData'
import type {
  Branding,
  BrandingInput,
  Cliente,
  MovimientoCredito,
  Orden,
  OrdenConDetalle,
  Perfil,
  Producto,
  Recarga,
} from '../types'

const KEY = {
  productos: 'stwm.productos.v1',
  clientes: 'stwm.clientes.v1',
  ordenes: 'stwm.ordenes.v1',
  branding: 'stwm.branding.v1',
  movimientos: 'stwm.movimientos.v1',
  recargas: 'stwm.recargas.v1',
  perfiles: 'stwm.perfiles.v1',
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
      return { ...item, precio: toNumber(item.precio), creditos: toNumber(item.creditos) }
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
        creditos_usados: toNumber(item.creditos_usados),
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
  hero_etiqueta: 'Reparación y accesorios',
  hero_titulo: 'Tu teléfono, en buenas manos',
  hero_descripcion:
    'Servicio Tecnico Walter Molares. Elegí el servicio o producto que necesitás y escribinos por WhatsApp: el mensaje ya incluye el código y el precio para que sepas exactamente de qué se trata.',
  hero_boton_servicios: 'Ver servicios',
  hero_boton_whatsapp: 'Escribinos por WhatsApp',
  servicios_titulo: 'Servicios y productos',
  servicios_descripcion: 'Precios de referencia. Confirmá disponibilidad al escribirnos.',
  binance_pay_id: '',
  binance_qr_url: '',
  binance_nota:
    'Transferí por Binance Pay y copiá la referencia que aparece acá en el campo "Nota" o "Referencia" del pago.',
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

// ------------------------ Perfil del usuario ------------------------

export async function getMiPerfil(userId: string): Promise<Perfil | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) throw error
    return (data as Perfil) ?? null
  }
  const perfiles = readLocal<Perfil>(KEY.perfiles, [])
  return (
    perfiles.find((p) => p.id === userId) ?? {
      id: userId,
      role: 'admin',
      nombre: 'Administrador (demo)',
      telefono: '',
    }
  )
}

export async function updateMiPerfil(
  userId: string,
  input: { nombre: string; telefono: string },
): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('profiles').update(input).eq('id', userId)
    if (error) throw error
    return
  }
  const perfiles = readLocal<Perfil>(KEY.perfiles, [])
  writeLocal(
    KEY.perfiles,
    perfiles.map((p) => (p.id === userId ? { ...p, ...input } : p)),
  )
}

// ------------------------------ Créditos ------------------------------

function demoMovimientos(userId: string): MovimientoCredito[] {
  const actuales = readLocal<MovimientoCredito>(KEY.movimientos, [])
  if (actuales.length) return actuales
  const inicial: MovimientoCredito[] = [
    {
      id: uid(),
      user_id: userId,
      tipo: 'recarga',
      creditos: 50,
      descripcion: 'Créditos de demostración',
      created_at: new Date().toISOString(),
    },
  ]
  writeLocal(KEY.movimientos, inicial)
  return inicial
}

function sumar(movimientos: MovimientoCredito[]): number {
  return movimientos.reduce((total, m) => total + toNumber(m.creditos), 0)
}

export async function getSaldo(userId: string): Promise<number> {
  if (supabase) {
    const { data, error } = await supabase.rpc('saldo_creditos')
    if (error) throw error
    return toNumber(data)
  }
  return sumar(demoMovimientos(userId))
}

export async function getMovimientos(userId: string): Promise<MovimientoCredito[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('movimientos_creditos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((row) => {
      const item = row as MovimientoCredito
      return { ...item, creditos: toNumber(item.creditos) }
    })
  }
  return demoMovimientos(userId).sort((a, b) =>
    (b.created_at ?? '').localeCompare(a.created_at ?? ''),
  )
}

export async function getSaldosPorUsuario(): Promise<Record<string, number>> {
  if (supabase) {
    const { data, error } = await supabase
      .from('movimientos_creditos')
      .select('user_id, creditos')
    if (error) throw error
    const saldos: Record<string, number> = {}
    for (const row of data ?? []) {
      saldos[row.user_id] = (saldos[row.user_id] ?? 0) + toNumber(row.creditos)
    }
    return saldos
  }
  const saldos: Record<string, number> = {}
  for (const movimiento of readLocal<MovimientoCredito>(KEY.movimientos, [])) {
    saldos[movimiento.user_id] = (saldos[movimiento.user_id] ?? 0) + toNumber(movimiento.creditos)
  }
  return saldos
}

export async function getRecargas(userId?: string): Promise<Recarga[]> {
  if (supabase) {
    let query = supabase
      .from('recargas')
      .select('*')
      .order('created_at', { ascending: false })
    if (userId) query = query.eq('user_id', userId)
    const { data, error } = await query
    if (error) throw error
    return (data ?? []).map((row) => {
      const item = row as Recarga
      return { ...item, creditos: toNumber(item.creditos) }
    })
  }
  return readLocal<Recarga>(KEY.recargas, [])
    .filter((r) => !userId || r.user_id === userId)
    .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
}

export async function solicitarRecarga(
  creditos: number,
  nota: string,
  userId: string,
): Promise<Recarga> {
  if (supabase) {
    const { data, error } = await supabase.rpc('solicitar_recarga', {
      p_creditos: creditos,
      p_nota: nota,
    })
    if (error) throw error
    return data as Recarga
  }
  const fila: Recarga = {
    id: uid(),
    user_id: userId,
    creditos,
    referencia: `WM-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    estado: 'pendiente',
    nota,
    comprobante_url: '',
    created_at: new Date().toISOString(),
  }
  const todas = readLocal<Recarga>(KEY.recargas, [])
  todas.unshift(fila)
  writeLocal(KEY.recargas, todas)
  return fila
}

export async function aprobarRecarga(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.rpc('aprobar_recarga', { p_recarga_id: id })
    if (error) throw error
    return
  }
  const todas = readLocal<Recarga>(KEY.recargas, [])
  const fila = todas.find((r) => r.id === id)
  if (!fila || fila.estado !== 'pendiente') throw new Error('Esta recarga ya fue revisada.')
  fila.estado = 'aprobada'
  fila.revisada_at = new Date().toISOString()
  writeLocal(KEY.recargas, todas)
  const movimientos = demoMovimientos(fila.user_id)
  movimientos.unshift({
    id: uid(),
    user_id: fila.user_id,
    tipo: 'recarga',
    creditos: fila.creditos,
    descripcion: `Recarga aprobada (${fila.referencia})`,
    recarga_id: fila.id,
    created_at: new Date().toISOString(),
  })
  writeLocal(KEY.movimientos, movimientos)
}

export async function rechazarRecarga(id: string, motivo = ''): Promise<void> {
  if (supabase) {
    const { error } = await supabase.rpc('rechazar_recarga', {
      p_recarga_id: id,
      p_motivo: motivo,
    })
    if (error) throw error
    return
  }
  const todas = readLocal<Recarga>(KEY.recargas, [])
  const fila = todas.find((r) => r.id === id)
  if (!fila || fila.estado !== 'pendiente') throw new Error('Esta recarga ya fue revisada.')
  fila.estado = 'rechazada'
  fila.revisada_at = new Date().toISOString()
  writeLocal(KEY.recargas, todas)
}

export async function pagarConCreditos(
  producto: Producto,
  userId: string,
): Promise<OrdenConDetalle> {
  if (supabase) {
    const { data, error } = await supabase.rpc('pagar_con_creditos', {
      p_producto_id: producto.id,
    })
    if (error) throw error
    return { ...(data as Orden), cliente: undefined, producto }
  }

  const movimientos = demoMovimientos(userId)
  const saldo = sumar(movimientos)
  if (saldo < producto.creditos) {
    throw new Error(
      `Saldo insuficiente: tenés ${saldo} créditos y necesitás ${producto.creditos}.`,
    )
  }

  const codigo = await nextOrdenCodigo()
  const now = new Date().toISOString()
  const creada: Orden = {
    id: uid(),
    codigo,
    cliente_id: 'demo-c1',
    producto_id: producto.id,
    estado: 'Recibido',
    precio: producto.precio,
    creditos_usados: producto.creditos,
    notas: `Pagado con ${producto.creditos} créditos.`,
    created_at: now,
    updated_at: now,
  }
  const ordenes = readLocal<Orden>(KEY.ordenes, demoOrdenes)
  ordenes.push(creada)
  writeLocal(KEY.ordenes, ordenes)

  movimientos.unshift({
    id: uid(),
    user_id: userId,
    tipo: 'compra',
    creditos: -producto.creditos,
    descripcion: `Compra ${codigo}: ${producto.nombre}`,
    orden_id: creada.id,
    created_at: now,
  })
  writeLocal(KEY.movimientos, movimientos)

  return { ...creada, cliente: undefined, producto }
}
