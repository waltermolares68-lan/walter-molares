# Servicio Tecnico Walter Molares

Sistema web de gestión para un taller de reparación de teléfonos: catálogo público con consultas por WhatsApp, registro de clientes, acceso por roles, créditos recargables vía Binance Pay y panel de administración con CRUD de servicios, clientes y compras.

## Características

- **Catálogo público** (sin login): servicios/productos con búsqueda, filtro por categoría, precio y botón «Consultar por WhatsApp» que ya incluye **código + nombre + precio**.
- **Registro público de clientes** en `/#/registro` con Supabase Auth y roles reales (`admin` / `cliente`). El panel es solo para el administrador.
- **Mi cuenta del cliente**: saldo en créditos, historial de movimientos, sus compras y recarga vía Binance Pay.
- **Créditos**: 1 crédito = 1 USD. Recargas de 10, 20, 30, 40, 50 o 100 créditos con referencia única; el admin aprueba la transferencia en **Panel → Recargas**.
- **Pago con créditos**: el cliente compra servicios desde el catálogo y el saldo se descuenta con historial. Cada servicio define su costo en créditos.
- **Panel de administración** con login: resumen, servicios, clientes, compras, recargas y marca.
- **CRUD completo** de tres entidades: `productos`, `clientes` y `ordenes` (compras/reparaciones).
- **WhatsApp por compra**: al crear una compra aparece un botón que envía el código de orden, el producto y el precio. También hay un botón en cada fila.
- **Estados de reparación**: Recibido → Diagnóstico → En reparación → Listo → Entregado / Cancelado.
- **Subida de imágenes** a Supabase Storage desde el panel (productos, logo y banner). En modo demo se guardan como datos locales.
- **Personalización de marca**: logo redondo (estilo foto de perfil, sin borde), imagen de presentación del encabezado (la foto del teléfono, con acceso directo «Cambiar imagen» para el admin), **textos del inicio** (título, descripción, botones y títulos de sección), **número de WhatsApp**, **redes sociales** (Instagram, Facebook, TikTok, YouTube), dirección, mapa y horario editables desde **Panel → Marca**, sin volver a publicar.
- **Supabase** para autenticación y base de datos con Row Level Security (RLS). Si no hay credenciales, la app entra en **modo demostración** con `localStorage`.
- **GitHub Pages** mediante GitHub Actions.

## Tecnologías

React 18 + TypeScript + Vite + Tailwind CSS + React Router (HashRouter) + Supabase + lucide-react.

## Estructura

```
src/
  components/   Layout, rutas protegidas, tarjetas y componentes de UI
  context/      AuthContext (Supabase Auth / demo local), BrandingContext
  hooks/        useWhatsapp (enlaces con el número editable del panel)
  lib/          supabase, data (CRUD), whatsapp, format, demoData
  pages/        Catálogo, Login, Registro, MiCuenta, Recargas, Dashboard, Productos, Clientes, Ordenes, Marca
supabase/
  schema.sql    Tablas, RLS y datos de prueba genéricos
.github/workflows/deploy.yml
GUIA_SUPABASE.md  Configuración paso a paso
GUIA_USO.md       Capacitación de uso
```

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # en Windows: copy .env.example .env.local
# editá .env.local con tus valores
npm run dev
```

El sitio queda en `http://localhost:5173/walter-molares/`.

> **Nunca commitees `.env.local`.** Está incluido en `.gitignore`. En producción los valores se inyectan como GitHub Actions Secrets.

### Variables de entorno

| Variable | Ejemplo | Uso |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | Proyecto de Supabase |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_xxx` | Clave pública (nunca `service_role`) |
| `VITE_WHATSAPP_NUMBER` | `5491135834902` | Solo dígitos, con código de país |
| `VITE_CURRENCY` | `ARS` | Moneda de los precios |
| `VITE_LOCALE` | `es-AR` | Formato de fecha y número |

## Puesta en marcha

1. Seguir **`GUIA_SUPABASE.md`** para crear tablas, políticas RLS, el usuario administrador y la configuración de registro (confirmación de email).
2. Configurar los Secrets del repositorio y activar Pages (mismo documento).
3. Subir los cambios a `main` (push directo o merge de un PR): el workflow compila y publica automáticamente.

URL pública: `https://waltermolares68-lan.github.io/walter-molares/`

## Seguridad

- La **anon/publishable key es pública por diseño**; la protección real la dan las políticas RLS de Supabase.
- El rol se lee de la tabla `profiles`, nunca del token: un cliente registrado **no puede** entrar al panel ni ver clientes, compras o movimientos de otros.
- Solo el administrador puede modificar productos, clientes, compras, branding e imágenes; el catálogo público solo lee productos activos.
- Los movimientos de créditos se escriben únicamente desde funciones RPC (`security definer`) que validan saldo y permisos; una recarga solo se acredita cuando el admin la aprueba.
- El modo demostración usa una contraseña de ejemplo y **no debe usarse con datos reales**.
- No se commitean credenciales, tokens ni datos de clientes reales. Los datos de prueba son genéricos.

## Imágenes

Las fotos se cargan desde URLs remotas de Unsplash, que permite uso comercial gratuito sin atribución obligatoria (https://unsplash.com/license). No se almacenan archivos de imagen en el repositorio. Si una URL falla, la tarjeta muestra un placeholder.

## Scripts

- `npm run dev` — servidor local
- `npm run build` — verificación de tipos + compilación
- `npm run preview` — previsualizar el build
- `npm run typecheck` — solo TypeScript

> Nota: `npm audit` reporta avisos de ReDoS en dependencias de **desarrollo** (`picomatch` usado por Vite/Tailwind). No afectan al sitio estático publicado.
