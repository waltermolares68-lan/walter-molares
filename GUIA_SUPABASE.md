# Guía de configuración (Supabase + GitHub Pages)

Seguí estos pasos una sola vez. Después, el sistema queda funcionando en la web.

---

## 1. Crear las tablas y las reglas de acceso

1. Entrá a https://supabase.com/dashboard y abrí tu proyecto.
2. En el menú lateral: **SQL Editor** → **New query**.
3. Copiá TODO el contenido de `supabase/schema.sql` de este repositorio y pegalo en el editor.
4. Presioná **Run**. Debe aparecer `Success. No rows returned` y luego los datos de ejemplo.
5. Verificá en **Table Editor** que existan las tablas `productos`, `clientes`, `ordenes`, `branding`, `profiles`, `recargas` y `movimientos_creditos`.
6. Verificá en `branding` las columnas nuevas de Binance Pay: `binance_pay_id`, `binance_qr_url` y `binance_nota` (además de las de logo, WhatsApp, redes, ubicación y textos del inicio).
7. Verificá en `productos` la columna `creditos` y en `ordenes` la columna `creditos_usados`. En `clientes` debe aparecer `user_id`.
8. Verificá en **Storage** que exista el bucket público `imagenes`.

> Si ya habías ejecutado el script antes, **volvé a ejecutarlo completo**: es seguro, no borra datos
> ni sobrescribe productos, clientes, compras, logo, WhatsApp, redes ni textos. Solo agrega tablas,
> columnas y permisos nuevos. Es **obligatorio** para el registro, los roles y los créditos.

> El script crea tres servicios de prueba genéricos (`SRV-001`, `SRV-002`, `ACC-003`). Podés borrarlos o editarlos desde el panel admin.

---

## 2. Confirmar el usuario administrador

Si ya tenés un usuario en Supabase, **no crees otro**: usá ese. El script lo va a marcar como `admin` al ser el más antiguo. Si todavía no tenés ninguno:

1. En Supabase: **Authentication** → **Users** → **Add user** → **Create new user**.
2. Elegí **Email and Password** y cargá un correo y una contraseña segura.
3. Marcá **Auto Confirm User** para que pueda ingresar sin verificar el email.
4. Guardá esos datos: son con los que vas a entrar al panel `/#/login`.

> No pongas esta contraseña en el repositorio. Cambiala desde Supabase cuando quieras.

### Quién queda como administrador

El script marca como **admin** al usuario más antiguo (el tuyo) y como **cliente** a los nuevos.
Si por casualidad hay más usuarios y el admin no quedó bien, ejecutá esto en **SQL Editor** reemplazando el email:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'TU_EMAIL@ejemplo.com');
update public.profiles set role = 'cliente'
where role = 'admin' and id <> (select id from auth.users where email = 'TU_EMAIL@ejemplo.com');
```

Para confirmarlo: **Table Editor → profiles** → la fila de tu email debe decir `role = admin`.

---

## 3. Configurar el registro de clientes

Los clientes se registran solos en `/#/registro`. Elegí una de estas dos opciones:

**Opción A (recomendada): con confirmación de email**
1. Supabase → **Authentication** → **Providers** → **Email**.
2. Dejá **Confirm email** activado.
3. En **Authentication** → **URL Configuration**, agregá en **Redirect URLs**:
   `https://waltermolares68-lan.github.io/walter-molares/**`
4. El cliente se registra, recibe un correo, confirma y después ingresa con su contraseña.

**Opción B: sin confirmación (más rápido, menos seguro)**
1. **Authentication** → **Providers** → **Email** → desactivá **Confirm email** → Save.
2. El cliente se registra y entra directamente a su cuenta.

> Con la Opción A, el correo de confirmación lo envía Supabase (tiene un límite de emails por hora en el plan gratis). Para producción conviene configurar un SMTP propio.

---

## 4. Cargar los Secrets en GitHub

1. Andá a https://github.com/waltermolares68-lan/walter-molares → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
2. Creá estos 5 secrets (el valor va sin comillas):

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://dmsuuxllqnbxirbaymfd.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | la publishable key de tu proyecto |
| `VITE_WHATSAPP_NUMBER` | `5491135834902` |
| `VITE_CURRENCY` | `ARS` |
| `VITE_LOCALE` | `es-AR` |

> Usá siempre la **anon / publishable key**. Nunca la `service_role`.

---

## 5. Activar GitHub Pages

1. En el repo: **Settings** → **Pages**.
2. En **Build and deployment** → **Source**, elegí **GitHub Actions**.
3. Guardá los cambios.

El workflow `.github/workflows/deploy.yml` se encarga del resto cuando hagas push a `main`.

---

## 6. Publicar

1. Subí los cambios a la rama `main` (push directo o merge de un Pull Request).
2. En **Actions** podés ver el trabajo `Deploy a GitHub Pages`. Cuando termine (verde), la web está en:

   `https://waltermolares68-lan.github.io/walter-molares/`

Cada push a `main` vuelve a publicar automáticamente.

---

## 7. Verificar que todo funciona

1. Abrí la URL pública: deben verse los servicios de ejemplo.
2. Tocá «Consultar por WhatsApp»: se abre el chat con el código y el precio en el mensaje.
3. Entrá a `/#/login` con el usuario creado en el paso 2: debe llevarte al **Panel** (no a «Mi cuenta»).
4. Creá una compra de prueba: debe aparecer el botón «Enviar por WhatsApp».
5. Desde otra cuenta (o en modo incógnito), registrate en `/#/registro`: debés llegar a **Mi cuenta**, no al panel.
6. En **Panel → Recargas** tenés que ver la solicitud pendiente con su referencia `WM-...`. Aprobala y verificá que el saldo del cliente aumente.
7. Configurá tu QR en **Panel → Marca → Binance Pay** y probá que se vea al recargar.

---

## Cambios frecuentes

- **Cambiar el número de WhatsApp**: entrá al panel → **Marca**, editá el número y guardá. No hace falta tocar Secrets ni volver a publicar. El Secret `VITE_WHATSAPP_NUMBER` queda solo como valor inicial/respaldo.
- **Cambiar logo, banner, redes, ubicación o QR de Binance Pay**: panel → **Marca** → guardar. Se aplica al instante en todo el sitio.
- **Cambiar el costo en créditos de un servicio**: panel → **Servicios** → lápiz → «Costo en créditos».
- **Acreditar una recarga**: panel → **Recargas** → botón «Aprobar». Verificá antes que la transferencia aparezca en tu Binance con esa referencia.
- **Cambiar moneda**: editá `VITE_CURRENCY` y `VITE_LOCALE` (son del build, requieren volver a publicar).
- **Cambiar contraseña del admin**: Supabase → Authentication → Users → seleccionar usuario → **Reset password**.
- **Agregar imágenes**: subilas desde el botón **«Elegir imagen»** del panel (se guardan en Supabase Storage) o pegá URLs de Unsplash/Pexels con licencia libre para uso comercial.
