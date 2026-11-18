-- ============================================================
-- Servicio Tecnico Walter Molares - Esquema inicial de Supabase
-- Ejecutar en: Supabase > SQL Editor > New query > Run
-- ============================================================

create extension if not exists pgcrypto;

-- ---------------- Perfiles y roles (base de la seguridad) ----------------
-- El rol NO se guarda en el token: se consulta acá para que no se pueda falsificar.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'cliente' check (role in ('admin', 'cliente')),
  nombre text not null default '',
  telefono text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- security definer: evita recursion con las propias políticas de profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

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

-- ------------------------- Créditos -------------------------
-- 1 crédito = 1 USD. Cada servicio define cuántos créditos cuesta (0 = no pagable con créditos).
alter table public.productos add column if not exists creditos integer not null default 0;
alter table public.ordenes add column if not exists creditos_usados integer not null default 0;

-- Un cliente registrado se vincula con su ficha de la tabla clientes.
alter table public.clientes add column if not exists user_id uuid references auth.users(id) on delete set null;
create unique index if not exists clientes_user_id_key on public.clientes (user_id) where user_id is not null;

create table if not exists public.recargas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  creditos integer not null check (creditos in (10, 20, 30, 40, 50, 100)),
  referencia text not null unique,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobada', 'rechazada')),
  nota text not null default '',
  comprobante_url text not null default '',
  created_at timestamptz not null default now(),
  revisada_at timestamptz,
  revisada_por uuid references auth.users(id)
);

create table if not exists public.movimientos_creditos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('recarga', 'compra', 'ajuste')),
  creditos integer not null,
  descripcion text not null default '',
  recarga_id uuid references public.recargas(id) on delete set null,
  orden_id uuid references public.ordenes(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists movimientos_user_idx on public.movimientos_creditos (user_id);
create index if not exists recargas_user_idx on public.recargas (user_id);

alter table public.recargas enable row level security;
alter table public.movimientos_creditos enable row level security;
alter table public.profiles enable row level security;

-- --------------------- Row Level Security ---------------------
alter table public.productos enable row level security;
alter table public.clientes enable row level security;
alter table public.ordenes enable row level security;

-- Catálogo público: cualquier visitante ve los productos ACTIVOS.
-- Solo el administrador ve todos (incluidos los desactivados).
drop policy if exists "productos_select_publico" on public.productos;
create policy "productos_select_publico"
  on public.productos for select
  using (activo or (select public.is_admin()));

drop policy if exists "productos_admin_all" on public.productos;
create policy "productos_admin_all"
  on public.productos for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Clientes: solamente el administrador.
drop policy if exists "clientes_admin_all" on public.clientes;
create policy "clientes_admin_all"
  on public.clientes for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Compras: el administrador ve todas; cada cliente ve SOLAMENTE las suyas.
drop policy if exists "ordenes_admin_all" on public.ordenes;
create policy "ordenes_admin_all"
  on public.ordenes for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Devuelve solo el id de la ficha del cliente actual, sin exponer la tabla de clientes.
create or replace function public.mi_cliente_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.clientes where user_id = (select auth.uid()) limit 1;
$$;

drop policy if exists "ordenes_cliente_select_own" on public.ordenes;
create policy "ordenes_cliente_select_own"
  on public.ordenes for select
  using (cliente_id = (select public.mi_cliente_id()));

-- Perfiles: cada uno ve el suyo; el administrador ve todos.
drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
  on public.profiles for select
  using (id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- El rol solo puede cambiarlo el administrador (defensa aunque haya otras políticas).
create or replace function public.profiles_no_cambiar_rol()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'No tenés permiso para cambiar el rol.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_no_cambiar_rol on public.profiles;
create trigger profiles_no_cambiar_rol
  before update on public.profiles
  for each row execute function public.profiles_no_cambiar_rol();

-- Recargas y movimientos: cada cliente ve solo lo suyo; el admin ve todo.
drop policy if exists "recargas_select" on public.recargas;
create policy "recargas_select"
  on public.recargas for select
  using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "recargas_insert_own" on public.recargas;
create policy "recargas_insert_own"
  on public.recargas for insert
  with check (user_id = (select auth.uid()) and estado = 'pendiente');

drop policy if exists "movimientos_select" on public.movimientos_creditos;
create policy "movimientos_select"
  on public.movimientos_creditos for select
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- ------------------ Datos de prueba GENÉRICOS ------------------
-- No contienen datos reales de clientes ni precios reales.
insert into public.productos (codigo, nombre, categoria, descripcion, precio, imagen_url, activo, creditos)
values
  ('SRV-001', 'Reparación de pantalla (demo)', 'Reparación', 'Servicio de ejemplo: reemplazo de pantalla.', 85000,
   'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', true, 20),
  ('SRV-002', 'Cambio de batería (demo)', 'Reparación', 'Servicio de ejemplo: reemplazo de batería.', 45000,
   'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80', true, 10),
  ('ACC-003', 'Funda protectora (demo)', 'Accesorio', 'Producto de ejemplo: funda universal.', 12000,
   'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80', true, 0)
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

-- Datos de Binance Pay (QR subido desde el panel + identificación y texto de ayuda).
alter table public.branding add column if not exists binance_pay_id text not null default '';
alter table public.branding add column if not exists binance_qr_url text not null default '';
alter table public.branding add column if not exists binance_nota text not null default 'Transferí por Binance Pay y copiá la referencia que aparece acá en el campo "Nota" o "Referencia" del pago.';

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
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

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
  with check (bucket_id = 'imagenes' and (select public.is_admin()));

drop policy if exists "imagenes_admin_update" on storage.objects;
create policy "imagenes_admin_update"
  on storage.objects for update
  using (bucket_id = 'imagenes' and (select public.is_admin()))
  with check (bucket_id = 'imagenes' and (select public.is_admin()));

drop policy if exists "imagenes_admin_delete" on storage.objects;
create policy "imagenes_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'imagenes' and (select public.is_admin()));

-- ==================== Registro público, roles y créditos ====================

-- Al crear un usuario: se crea su perfil (cliente) y su ficha en clientes.
-- El PRIMER usuario existente queda como admin; los que se registren después, como clientes.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nombre text := coalesce(nullif(new.raw_user_meta_data->>'nombre', ''), split_part(new.email, '@', 1));
  v_role text;
begin
  select case when exists (select 1 from public.profiles where role = 'admin')
              then 'cliente' else 'admin' end
    into v_role;

  insert into public.profiles (id, role, nombre)
  values (new.id, v_role, v_nombre)
  on conflict (id) do nothing;

  if not exists (select 1 from public.clientes where user_id = new.id) then
    insert into public.clientes (nombre, user_id, notas)
    values (v_nombre, new.id, 'Registrado desde la web');
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Usuarios creados ANTES de este script: se crea su perfil y su ficha.
-- El más antiguo pasa a ser el administrador (el tuyo). Es idempotente: podés correrlo varias veces.
do $$
declare
  u record;
  v_nombre text;
begin
  for u in
    select id, email, coalesce(nullif(raw_user_meta_data->>'nombre', ''), split_part(email, '@', 1)) as nombre
      from auth.users
     order by created_at asc
  loop
    v_nombre := u.nombre;

    insert into public.profiles (id, role, nombre)
    values (
      u.id,
      case when exists (select 1 from public.profiles where role = 'admin') then 'cliente' else 'admin' end,
      v_nombre
    )
    on conflict (id) do nothing;

    if not exists (select 1 from public.clientes where user_id = u.id) then
      insert into public.clientes (nombre, user_id, notas)
      values (v_nombre, u.id, 'Registrado desde la web');
    end if;
  end loop;
end $$;

-- Saldo disponible del usuario actual.
create or replace function public.saldo_creditos()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(creditos), 0)::integer
    from public.movimientos_creditos
   where user_id = (select auth.uid());
$$;

-- El cliente crea una solicitud: se genera una referencia única para poner en la nota de Binance Pay.
create or replace function public.solicitar_recarga(p_creditos integer, p_nota text default '')
returns public.recargas
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_ref text;
  v_row public.recargas;
begin
  if v_uid is null then
    raise exception 'Iniciá sesión para solicitar una recarga.';
  end if;
  if p_creditos not in (10, 20, 30, 40, 50, 100) then
    raise exception 'Elegí un monto permitido: 10, 20, 30, 40, 50 o 100 créditos.';
  end if;

  loop
    v_ref := 'WM-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (select 1 from public.recargas where referencia = v_ref);
  end loop;

  insert into public.recargas (user_id, creditos, referencia, nota)
  values (v_uid, p_creditos, v_ref, coalesce(left(p_nota, 300), ''))
  returning * into v_row;

  return v_row;
end;
$$;

-- El admin aprueba: se acreditan los créditos una sola vez.
create or replace function public.aprobar_recarga(p_recarga_id uuid)
returns public.recargas
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.recargas;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede aprobar recargas.';
  end if;

  select * into v_row from public.recargas where id = p_recarga_id for update;
  if not found then
    raise exception 'No se encontró la recarga.';
  end if;
  if v_row.estado <> 'pendiente' then
    raise exception 'Esta recarga ya fue revisada.';
  end if;

  update public.recargas
     set estado = 'aprobada', revisada_at = now(), revisada_por = auth.uid()
   where id = p_recarga_id
  returning * into v_row;

  insert into public.movimientos_creditos (user_id, tipo, creditos, descripcion, recarga_id)
  values (v_row.user_id, 'recarga', v_row.creditos, 'Recarga aprobada (' || v_row.referencia || ')', v_row.id);

  return v_row;
end;
$$;

create or replace function public.rechazar_recarga(p_recarga_id uuid, p_motivo text default '')
returns public.recargas
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.recargas;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede rechazar recargas.';
  end if;

  select * into v_row from public.recargas where id = p_recarga_id for update;
  if not found then
    raise exception 'No se encontró la recarga.';
  end if;
  if v_row.estado <> 'pendiente' then
    raise exception 'Esta recarga ya fue revisada.';
  end if;

  update public.recargas
     set estado = 'rechazada',
         revisada_at = now(),
         revisada_por = auth.uid(),
         nota = v_row.nota || case when coalesce(p_motivo, '') = '' then '' else ' | Rechazo: ' || left(p_motivo, 200) end
   where id = p_recarga_id
  returning * into v_row;

  return v_row;
end;
$$;

-- El cliente paga un servicio con sus créditos: crea la compra y descuenta en un solo paso.
create or replace function public.pagar_con_creditos(p_producto_id uuid)
returns public.ordenes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_prod public.productos;
  v_cliente public.clientes;
  v_saldo integer;
  v_codigo text;
  v_orden public.ordenes;
begin
  if v_uid is null then
    raise exception 'Iniciá sesión para pagar con créditos.';
  end if;

  select * into v_prod from public.productos where id = p_producto_id and activo;
  if not found then
    raise exception 'El servicio no está disponible.';
  end if;
  if v_prod.creditos <= 0 then
    raise exception 'Este servicio no se puede pagar con créditos.';
  end if;

  select * into v_cliente from public.clientes where user_id = v_uid;
  if not found then
    raise exception 'No hay una ficha de cliente asociada a tu usuario.';
  end if;

  select coalesce(sum(creditos), 0)::integer into v_saldo
    from public.movimientos_creditos
   where user_id = v_uid;

  if v_saldo < v_prod.creditos then
    raise exception 'Saldo insuficiente: tenés ' || v_saldo || ' créditos y necesitás ' || v_prod.creditos || '.';
  end if;

  v_codigo := 'ORD-' || lpad(
    (select coalesce(max(nullif(regexp_replace(codigo, '\D', '', 'g'), '')::integer), 0) + 1
       from public.ordenes)::text,
    4, '0');

  insert into public.ordenes (codigo, cliente_id, producto_id, estado, precio, notas, creditos_usados)
  values (v_codigo, v_cliente.id, v_prod.id, 'Recibido', v_prod.precio,
          'Pagado con ' || v_prod.creditos || ' créditos.', v_prod.creditos)
  returning * into v_orden;

  insert into public.movimientos_creditos (user_id, tipo, creditos, descripcion, orden_id)
  values (v_uid, 'compra', -v_prod.creditos, 'Compra ' || v_codigo || ': ' || v_prod.nombre, v_orden.id);

  return v_orden;
end;
$$;

-- Permisos de tabla (Supabase ya los da por defecto; los repetimos para asegurar).
grant select, insert on public.recargas to authenticated;
grant select on public.movimientos_creditos to authenticated;
grant select, update on public.profiles to authenticated;

-- Si el administrador no quedó bien asignado, podés corregirlo acá reemplazando el email
-- y ejecutando SOLO estas dos líneas en el SQL Editor (no es necesario tocar nada más):
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'TU_EMAIL@ejemplo.com');
-- update public.profiles set role = 'cliente' where role = 'admin' and id <> (select id from auth.users where email = 'TU_EMAIL@ejemplo.com');

-- Permisos: solo usuarios logueados pueden llamar a las funciones de dinero.
revoke all on function public.solicitar_recarga(integer, text) from public;
grant execute on function public.solicitar_recarga(integer, text) to authenticated;

revoke all on function public.aprobar_recarga(uuid) from public;
grant execute on function public.aprobar_recarga(uuid) to authenticated;

revoke all on function public.rechazar_recarga(uuid, text) from public;
grant execute on function public.rechazar_recarga(uuid, text) to authenticated;

revoke all on function public.pagar_con_creditos(uuid) from public;
grant execute on function public.pagar_con_creditos(uuid) to authenticated;

revoke all on function public.saldo_creditos() from public;
grant execute on function public.saldo_creditos() to authenticated;
