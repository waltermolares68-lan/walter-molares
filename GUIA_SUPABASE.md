# Guía de configuración (Supabase + GitHub Pages)

Seguí estos pasos una sola vez. Después, el sistema queda funcionando en la web.

---

## 1. Crear las tablas y las reglas de acceso

1. Entrá a https://supabase.com/dashboard y abrí tu proyecto.
2. En el menú lateral: **SQL Editor** → **New query**.
3. Copiá TODO el contenido de `supabase/schema.sql` de este repositorio y pegalo en el editor.
4. Presioná **Run**. Debe aparecer `Success. No rows returned` y luego los datos de ejemplo.
5. Verificá en **Table Editor** que existan las tablas `productos`, `clientes`, `ordenes` y `branding`.
6. Verificá en **Storage** que exista el bucket público `imagenes`.

> Si ya habías ejecutado el script antes, **volvé a ejecutarlo completo**: es seguro, no borra datos
> y solo agrega la tabla `branding`, el bucket `imagenes` y sus permisos. Necesario para subir
> imágenes y cambiar el logo/banner desde el panel.

> El script crea tres servicios de prueba genéricos (`SRV-001`, `SRV-002`, `ACC-003`). Podés borrarlos o editarlos desde el panel admin.

---

## 2. Crear el usuario administrador

1. En Supabase: **Authentication** → **Users** → **Add user** → **Create new user**.
2. Elegí **Email and Password** y cargá un correo y una contraseña segura.
3. Marcá **Auto Confirm User** para que pueda ingresar sin verificar el email.
4. Guardá esos datos: son con los que vas a entrar al panel `/#/login`.

> No pongas esta contraseña en el repositorio. Cambiala desde Supabase cuando quieras.

---

## 3. Cargar los Secrets en GitHub

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

## 4. Activar GitHub Pages

1. En el repo: **Settings** → **Pages**.
2. En **Build and deployment** → **Source**, elegí **GitHub Actions**.
3. Guardá los cambios.

El workflow `.github/workflows/deploy.yml` se encarga del resto cuando hagas push a `main`.

---

## 5. Publicar

1. El código está en la rama `feature/crud-reparaciones`.
2. Hacé **Pull request** → a `main` → **Merge pull request**.
3. En **Actions** podés ver el trabajo `Deploy a GitHub Pages`. Cuando termine (verde), la web está en:

   `https://waltermolares68-lan.github.io/walter-molares/`

Cada push a `main` vuelve a publicar automáticamente.

---

## 6. Verificar que todo funciona

1. Abrí la URL pública: deben verse los servicios de ejemplo.
2. Tocá «Consultar por WhatsApp»: se abre el chat con el código y el precio en el mensaje.
3. Entrá a `/#/login` con el usuario creado en el paso 2.
4. Creá una compra de prueba: debe aparecer el botón «Enviar por WhatsApp».

---

## Cambios frecuentes

- **Cambiar el número de WhatsApp**: editá el Secret `VITE_WHATSAPP_NUMBER` y hacé un push a `main` (o `workflow_dispatch` en Actions) para recomilar.
- **Cambiar moneda**: editá `VITE_CURRENCY` y `VITE_LOCALE`.
- **Cambiar contraseña del admin**: Supabase → Authentication → Users → seleccionar usuario → **Reset password**.
- **Agregar imágenes**: usá URLs de Unsplash/Pexels con licencia libre para uso comercial y pegalas en el campo «URL de la imagen».
