-- ============================================================
-- Servicio Tecnico Walter Molares - Esquema inicial de Supabase
-- Ejecutar en: Supabase > SQL Editor > New query > Run
-- ============================================================

create extension if not exists pgcrypto;

-- --------------------------- Tablas ---------------------------

create table if not exists public.productos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nombre text not null,
  categoria text not null default 'Reparación',
  descripcion text not null default '',
  precio numeric(10,2) not null default 0,
  imagen_url text not null default '',
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text not null default '',
  direccion text not null default '',
  notas text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.ordenes (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  producto_id uuid not null references public.productos(id) on delete restrict,
  estado text not null default 'Recibido',
  precio numeric(10,2) not null,
  notas text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ordenes_cliente_idx on public.ordenes (cliente_id);
create index if not exists ordenes_producto_idx on public.ordenes (producto_id);

-- --------------------- Row Level Security ---------------------
alter table public.productos enable row level security;
alter table public.clientes enable row level security;
alter table public.ordenes enable row level security;

-- Catálogo público: cualquier visitante ve los productos ACTIVOS.
-- El administrador autenticado ve todos (incluidos los desactivados).
drop policy if exists "productos_select_publico" on public.productos;
create policy "productos_select_publico"
  on public.productos for select
  using (activo or (select auth.role()) = 'authenticated');

drop policy if exists "productos_admin_all" on public.productos;
create policy "productos_admin_all"
  on public.productos for all
  using ((select auth.role()) = 'authenticated')
  with check ((select auth.role()) = 'authenticated');

-- Clientes y compras: solamente el administrador autenticado.
drop policy if exists "clientes_admin_all" on public.clientes;
create policy "clientes_admin_all"
  on public.clientes for all
  using ((select auth.role()) = 'authenticated')
  with check ((select auth.role()) = 'authenticated');

drop policy if exists "ordenes_admin_all" on public.ordenes;
create policy "ordenes_admin_all"
  on public.ordenes for all
  using ((select auth.role()) = 'authenticated')
  with check ((select auth.role()) = 'authenticated');

-- ------------------ Datos de prueba GENÉRICOS ------------------
-- No contienen datos reales de clientes ni precios reales.
insert into public.productos (codigo, nombre, categoria, descripcion, precio, imagen_url, activo)
values
  ('SRV-001', 'Reparación de pantalla (demo)', 'Reparación', 'Servicio de ejemplo: reemplazo de pantalla.', 85000,
   'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', true),
  ('SRV-002', 'Cambio de batería (demo)', 'Reparación', 'Servicio de ejemplo: reemplazo de batería.', 45000,
   'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80', true),
  ('ACC-003', 'Funda protectora (demo)', 'Accesorio', 'Producto de ejemplo: funda universal.', 12000,
   'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80', true)
on conflict (codigo) do nothing;

-- ==================== Marca y almacenamiento de imágenes ====================

create table if not exists public.branding (
  id boolean primary key default true check (id),
  logo_url text not null default '',
  banner_url text not null default '',
  updated_at timestamptz not null default now()
);

-- Columnas del panel (seguro si la tabla ya existía): WhatsApp, redes y ubicación.
alter table public.branding add column if not exists whatsapp text not null default '5491135834902';
alter table public.branding add column if not exists instagram text not null default '';
alter table public.branding add column if not exists facebook text not null default '';
alter table public.branding add column if not exists tiktok text not null default '';
alter table public.branding add column if not exists youtube text not null default '';
alter table public.branding add column if not exists direccion text not null default '';
alter table public.branding add column if not exists mapa_url text not null default '';
alter table public.branding add column if not exists horario text not null default '';

-- Textos editables del catálogo (encabezado y sección de servicios).
alter table public.branding add column if not exists hero_etiqueta text not null default 'Reparación y accesorios';
alter table public.branding add column if not exists hero_titulo text not null default 'Tu teléfono, en buenas manos';
alter table public.branding add column if not exists hero_descripcion text not null default 'Servicio Tecnico Walter Molares. Elegí el servicio o producto que necesitás y escribinos por WhatsApp: el mensaje ya incluye el código y el precio para que sepas exactamente de qué se trata.';
alter table public.branding add column if not exists hero_boton_servicios text not null default 'Ver servicios';
alter table public.branding add column if not exists hero_boton_whatsapp text not null default 'Escribinos por WhatsApp';
alter table public.branding add column if not exists servicios_titulo text not null default 'Servicios y productos';
alter table public.branding add column if not exists servicios_descripcion text not null default 'Precios de referencia. Confirmá disponibilidad al escribirnos.';

insert into public.branding (id, logo_url, banner_url)
values (true, '', '')
on conflict (id) do nothing;

alter table public.branding enable row level security;

-- El logo y el banner son públicos (los ve cualquiera); solo el admin los edita.
drop policy if exists "branding_select_publico" on public.branding;
create policy "branding_select_publico"
  on public.branding for select
  using (true);

drop policy if exists "branding_admin_all" on public.branding;
create policy "branding_admin_all"
  on public.branding for all
  using ((select auth.role()) = 'authenticated')
  with check ((select auth.role()) = 'authenticated');

-- Bucket público para las imágenes subidas desde el panel.
insert into storage.buckets (id, name, public)
values ('imagenes', 'imagenes', true)
on conflict (id) do nothing;

drop policy if exists "imagenes_public_select" on storage.objects;
create policy "imagenes_public_select"
  on storage.objects for select
  using (bucket_id = 'imagenes');

drop policy if exists "imagenes_admin_insert" on storage.objects;
create policy "imagenes_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'imagenes' and (select auth.role()) = 'authenticated');

drop policy if exists "imagenes_admin_update" on storage.objects;
create policy "imagenes_admin_update"
  on storage.objects for update
  using (bucket_id = 'imagenes' and (select auth.role()) = 'authenticated')
  with check (bucket_id = 'imagenes' and (select auth.role()) = 'authenticated');

drop policy if exists "imagenes_admin_delete" on storage.objects;
create policy "imagenes_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'imagenes' and (select auth.role()) = 'authenticated');
