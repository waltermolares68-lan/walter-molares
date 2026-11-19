# Capacitación: cómo usar la web

Esta guía explica el uso diario. La web tiene tres partes: el **catálogo público** (lo ve cualquiera), la **cuenta del cliente** (saldo y compras) y el **panel de administración** (solo vos).

---

## 1. Catálogo público

URL: `https://waltermolares68-lan.github.io/walter-molares/`

- En la parte superior verás el nombre **Servicio Tecnico Walter Molares** y un botón para escribir por WhatsApp.
- En **Servicios y productos** podés:
  - buscar por nombre, descripción o código;
  - filtrar por categoría (Reparación, Repuesto, Accesorio, Otro);
  - ver el precio de cada servicio.
- Al tocar **«Consultar por WhatsApp»** se abre WhatsApp con un mensaje listo, por ejemplo:

  > Hola! Quisiera consultar por *Reparación de pantalla (demo)* (SRV-001). Precio: $85.000,00. ¿Podrían ayudarme?

  El cliente y vos ven el mismo código y precio, así no hay confusiones.

---

## 2. Ingresar (administrador y clientes)

1. Tocá **«Ingresar»** arriba a la derecha (o entrá a `/#/login`).
2. Cargá tu email y contraseña.
3. Si sos **administrador**, entrás al **Panel**. Si sos **cliente**, entrás a **Mi cuenta**. Cada uno ve solo lo que le corresponde.

Para salir, tocá **«Salir»** en el menú superior. Los clientes pueden crear su cuenta con **«Crear cuenta»** (o en `/#/registro`).

---

## 3. Clientes: registro, cuenta y créditos

**Cómo se registran:** tocá **«Crear cuenta»**, completá nombre, email y contraseña (mínimo 6 caracteres). Si Supabase pide confirmación, abrí el correo y confirmá; después ya podés ingresar. No hace falta que yo cree el usuario a mano.

**Qué ve el cliente en «Mi cuenta»:**

- **Saldo disponible** en créditos (1 crédito = 1 USD).
- **Botón «Recargar créditos»**: elige 10, 20, 30, 40, 50 o 100.
- **Historial de créditos**: cada recarga suma y cada compra descuenta.
- **Mis compras**: sus propias compras y estados, con código y fecha.

**Cómo paga un servicio:** el cliente busca el servicio en el catálogo y toca **«Comprar con X créditos»** (solo aparece si el servicio tiene créditos cargados). La compra se registra sola y el saldo se descuenta. Si no alcanza, lo llevamos a recargar.

**Correos de una compra:** se envían dos. Vos recibís **«Nueva compra pendiente»** para cargar las credenciales de la renta. El cliente recibe **«Compra confirmada»** al correo con el que se registró, con el producto comprado y un link a **Mi cuenta**, donde ve el estado y los resultados de su servicio. Si el cliente fue cargado a mano y no tiene usuario web, solo llega el tuyo.

> **Correo saliente:** los avisos se envían con **Brevo** (plan gratis, hasta 300 correos por día). Hay que verificar un remitente en **Brevo → Senders & Domains** y cargar su API key en Supabase Vault con los bloques 3 y 4 de la página SQL. El remitente verificado puede ser tu propio Gmail, sin necesidad de comprar un dominio.

**Cómo recarga:**

1. En **Mi cuenta** → **«Recargar créditos»**, elige el monto y tocá **«Continuar»**.
2. Se genera una **referencia única** (`WM-XXXXXXXX`): copiala.
3. Hacé la transferencia por **Binance Pay** escaneando mi QR y **pegá esa referencia en la nota/referencia del pago**.
4. El saldo se acredita cuando yo apruebo la solicitud en el panel.

---

## 4. Panel de administración

El panel muestra cuatro números: compras registradas, en curso, listas para entregar y clientes. Debajo están las últimas compras, cada una con su botón de WhatsApp.

Menú superior:

| Sección | Para qué sirve |
|---|---|
| **Panel** | Resumen general |
| **Servicios** | Catálogo (CRUD) |
| **Clientes** | Registro de clientes (CRUD) |
| **Compras** | Ventas y reparaciones (CRUD) |
| **Recargas** | Aprobar o rechazar recargas de créditos |
| **Marca** | Logo, textos, WhatsApp, redes, ubicación y QR de Binance Pay |

---

## 5. Servicios (catálogo)

En **Servicios** podés crear, editar, ocultar y eliminar.

**Campos:**
- **Código**: aparece en el mensaje de WhatsApp. Ejemplo: `SRV-005`.
- **Categoría**: Reparación / Repuesto / Accesorio / Otro.
- **Nombre** y **Descripción**: lo que ve el cliente.
- **Precio**: se muestra con el formato `ARS` (ej. `$85.000,00`).
- **Costo en créditos**: cuántos créditos se descuentan si el cliente paga desde su cuenta. `1 crédito = 1 USD`. Si lo dejás en `0`, el servicio solo se consulta por WhatsApp y no aparece el botón de compra. Podés poner otro número aunque el precio en pesos siga igual.
- **Visible en el catálogo**: si lo desactivás (`No`), el cliente deja de verlo, pero se conserva para las compras anteriores.
- **Imagen del servicio**: tocá **«Elegir imagen»** para subir tu propia foto desde la computadora, o pegá una URL de stock con licencia libre (Unsplash/Pexels). También podés **Quitar** la imagen. Si el enlace falla, se muestra un placeholder.

**Buenas prácticas:**
- Usá códigos cortos y únicos (`SRV-001`, `ACC-003`).
- Si un servicio ya tiene compras, **desactivalo** en lugar de eliminarlo.
- Revisá el botón «WhatsApp» de la fila para confirmar cómo queda el mensaje.

---

## 6. Clientes

En **Clientes** podés dar de alta, editar y eliminar.

- **Nombre**: obligatorio.
- **Teléfono**: con código de país y solo dígitos, ej. `5491135834902`.
- **Dirección** y **Notas**: información interna (no se muestra en el catálogo).
- El icono verde de WhatsApp escribe directamente a ese cliente.
- **Saldo**: la columna muestra los créditos disponibles de los clientes registrados en la web. Los que cargaste a mano muestran `—`.
- Los clientes que se registraron solos aparecen con el badge **Web** al lado del nombre; son los que pueden ingresar a **Mi cuenta**, recargar y pagar con créditos.
- No se puede eliminar un cliente que tenga compras asociadas.

---

## 7. Compras y reparaciones

En **Compras** registrás cada venta o trabajo.

### Crear una compra

1. Tocá **«Nueva compra»**.
2. Elegí el **cliente** y el **servicio/producto**. El precio se completa automáticamente, pero podés cambiarlo (útil si hiciste un descuento).
3. Elegí el **estado** inicial (normalmente `Recibido`).
4. Agregá notas internas si querés.
5. Tocá **«Guardar compra»**.

Al guardar aparece un cartel verde con el número de orden (por ejemplo `ORD-0004`) y el botón **«Enviar por WhatsApp»**. Ese mensaje incluye:

- el código de la compra (`ORD-0004`);
- el nombre y código del producto (`SRV-001`);
- el precio;
- el estado actual.

También podés usar el botón **«WhatsApp»** de cualquier fila, incluso días después.

### Estados

`Recibido` → `Diagnóstico` → `En reparación` → `Listo` → `Entregado`.
También existe `Cancelado` para trabajos que no se hicieron.

Para cambiar el estado, tocá el lápiz de la fila, elegí el nuevo estado y guardá.

### Filtrar

Usá **«Filtrar por estado»** para ver, por ejemplo, solo lo que está `Listo` para entregar.

---

## 8. Marca, WhatsApp, redes y Binance Pay

En el menú **Marca** podés personalizar el sitio **sin volver a publicar**:

- **Logo de tu marca**: subí una imagen cuadrada. Se muestra **redonda, como una foto de perfil y sin borde**, al lado del nombre del taller.
- **Imagen de presentación (la foto del teléfono que aparece arriba del catálogo)**: acá se cambia la foto grande del encabezado, la que viene con un iPhone de ejemplo. Subí la tuya y la reemplaza. Si es ancha (por ejemplo 1200 x 400 px), se ve mejor. También podés tocar **«Cambiar imagen»** directamente sobre la foto del catálogo (solo visible cuando estás logueado): te lleva a este panel.
- **WhatsApp**: cargá tu número **solo con números y código de país** (ejemplo `5491135834902`, sin el `+`). Todos los botones «Consultar por WhatsApp» del catálogo y del panel usan este número. El botón **«Probar número»** abre WhatsApp para que verifiques que es correcto.
- **Redes sociales**: Instagram, Facebook, TikTok y YouTube. Pegá el enlace completo o solo tu usuario (ejemplo `@tuusuario`). Las que dejes vacías no se muestran. Aparecen en la sección **Contacto y redes** del catálogo y como iconos en el pie del sitio.
- **Ubicación y horario**: dirección, enlace de Google Maps (o la dirección directamente) y horario de atención. Se muestra en la sección **Ubicación** del catálogo, con un enlace **«Cómo llegar»**.
- **Textos de la pantalla de inicio**: podés cambiar la etiqueta pequeña, el título grande, el párrafo de presentación, el texto de los dos botones y el título/descripción de la sección «Servicios y productos». Si dejás un campo vacío, se usa el texto original.
- **Binance Pay (recargas)**: subí tu **código QR** (generalo en Binance → Recibir → Binance Pay → Compartir QR) y, si querés, cargá tu **Pay ID** y un **texto de ayuda**. Es lo que ven los clientes al tocar «Recargar créditos». Cada recarga genera una referencia `WM-XXXXXXXX` que el cliente pone como nota de la transferencia; después la aprobás en **Recargas**.

Tocá **«Guardar cambios»** y todo se ve enseguida en el sitio. Arriba del formulario hay una **vista previa** con el logo redondo, el número y los iconos de las redes cargadas.

> Si cambiás de teléfono, entrá acá, actualizá el número y guardá: no hace falta volver a publicar la web.

> Si todavía no aparece el menú **Marca** o no podés guardar estos campos, ejecutá de nuevo `supabase/schema.sql` en Supabase (ver `GUIA_SUPABASE.md`, paso 1).

---

## 9. Recargas: cómo aprobarlas

En **Panel → Recargas** ves las solicitudes de los clientes.

1. Entrá a tu app de **Binance** y buscá la transferencia con la **referencia** que aparece en la fila (por ejemplo `WM-A1B2C3D4`). Revisá el monto: debe ser exactamente US$ 10, 20, 30, 40, 50 o 100.
2. Si coincide, tocá **«Aprobar»**: se acreditan los créditos automáticamente y aparecen en el historial del cliente.
3. Si no encontrás el pago o el monto no coincide, tocá **«Rechazar»** y escribí el motivo.

Podés alternar entre **«Solo pendientes»** y **«Ver todas»** para revisar el historial. Si aprobás dos veces la misma recarga, el sistema lo impide.

> Importante: el cliente recibe créditos **solo después** de que apruebes. No apruebes sin verificar la transferencia en tu Binance.

---

## 10. Problemas frecuentes

| Situación | Solución |
|---|---|
| El catálogo muestra datos "demo" | Falta configurar Supabase o las tablas. Revisá `GUIA_SUPABASE.md`. |
| No puedo ingresar | El usuario se crea en Supabase → Authentication → Users. No funciona el usuario de ejemplo cuando Supabase está configurado. |
| El botón de WhatsApp abre un número equivocado | Entrá a **Marca**, corregí el número y guardá. Solo si aún no cargaste el esquema nuevo, actualizá el Secret `VITE_WHATSAPP_NUMBER` y volvé a publicar. |
| Una imagen no carga | Reemplazá la URL por otra de Unsplash/Pexels. |
| Los precios salen con otro símbolo | Revisá los Secrets `VITE_CURRENCY` y `VITE_LOCALE`. |
| Al tocar «Ver servicios» sale 404 | Recargá la página con `Ctrl+F5`; el enlace ya está corregido en la última versión. |
| No aparece el menú «Marca» o no puedo subir imágenes | Ejecutá de nuevo `supabase/schema.sql` y revisá que exista el bucket `imagenes`. |
| Un cliente no puede ingresar | Confirmá que terminó el registro (o el correo de confirmación) y que su email esté en Supabase → Authentication → Users. |
| Un cliente entra al panel | Ejecutá `supabase/schema.sql` y verificá en `profiles` que su `role` sea `cliente` y el tuyo `admin`. |
| No ve el saldo ni el botón «Comprar con créditos» | Ejecutá de nuevo el SQL, revisá que `productos.creditos` sea mayor que 0 y refrescá con `Ctrl+F5`. |
| Hice una transferencia pero no se acreditó | Buscá la referencia `WM-...` en **Panel → Recargas** y aprobala recién después de verificar el pago en Binance. |
| No se ve mi QR al recargar | Cargalo en **Panel → Marca → Binance Pay**, guardá y probá desde la cuenta de un cliente. |

---

## 11. Cómo se actualiza la web

Los cambios se publican solos cuando se suben a `main`:

1. Editás el código (o pedís un cambio).
2. Se hace merge a `main`.
3. GitHub Actions compila y publica en `https://waltermolares68-lan.github.io/walter-molares/`.

Los datos (productos, clientes, compras, WhatsApp, redes, ubicación, logo y banner) **no están en el código**: están en Supabase, así que podés modificarlos desde el panel sin volver a publicar.
