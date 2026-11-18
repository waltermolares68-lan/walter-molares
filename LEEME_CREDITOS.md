# Créditos, cuentas y recargas con Binance Pay

Este paquete trae SOLO los archivos nuevos o modificados. Copialos a tu repo respetando las carpetas.

## Archivos nuevos
- src/lib/creditos.ts
- src/components/AccountPill.tsx
- src/pages/Recargar.tsx
- src/pages/Cuenta.tsx
- src/pages/AdminRecargas.tsx

## Archivos modificados (reemplazan a los actuales)
- src/App.tsx, src/types.ts
- src/context/AuthContext.tsx, src/components/ProtectedRoute.tsx
- src/pages/Login.tsx, src/components/ProductCard.tsx
- src/pages/Ordenes.tsx, src/pages/Dashboard.tsx
- src/lib/format.ts, src/lib/whatsapp.ts, src/lib/data.ts
- .github/workflows/deploy.yml, .env.example

NO se tocaron Layout.tsx ni Catalogo.tsx, para no pisar tu dirección, "cómo llegar", Facebook e Instagram.

## Antes de publicar
1. Subí el QR de Binance Pay como public/binance-qr.png
2. En GitHub: Settings > Secrets and variables > Actions > New secret
   Nombre: VITE_BINANCE_PAY_ID   Valor: tu Pay ID
3. En Supabase > Authentication > Providers > Email: decidí si querés
   "Confirm email" (más seguro) o apagado (registro inmediato).
4. Subí todo a una rama nueva y probá antes de pasarlo a main.

## Cómo funciona
- Cliente: crea cuenta (usuario único) > Recargar (mínimo 10) > paga por Binance Pay con la referencia en la nota.
- Vos: menú de abajo a la izquierda > Recargas pendientes > Acreditar.
- Sin créditos no se puede comprar. Los precios de los servicios ahora son en créditos.
