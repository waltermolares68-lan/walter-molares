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
