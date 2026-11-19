import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const base = path.dirname(fileURLToPath(import.meta.url))
const esquema = fs.readFileSync(path.join(base, 'supabase', 'schema.sql'), 'utf8')

function esc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const parche = `-- Si te dio el error 42P13, ejecutá solo este bloque.
drop function if exists public.saldo_creditos();

create or replace function public.saldo_creditos()
returns numeric(10,2)
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(creditos), 0)::numeric(10,2)
    from public.movimientos_creditos
   where user_id = (select auth.uid());
$$;

revoke all on function public.saldo_creditos() from public;
grant execute on function public.saldo_creditos() to authenticated;
`

const secretos = `-- Reemplazá la clave por la tuya. El remitente lo dejamos así para probar.
delete from vault.secrets
where name in ('RESEND_API_KEY', 'RESEND_FROM');

select vault.create_secret('re_AQUI_TU_KEY_NUEVA', 'RESEND_API_KEY');

select vault.create_secret(
  'Servicio Tecnico Walter Molares <onboarding@resend.dev>',
  'RESEND_FROM'
);

-- IMPORTANTE: onboarding@resend.dev solo entrega al correo de tu cuenta de Resend.
-- Para que el cliente reciba su confirmación, verificá un dominio en Resend
-- y reemplazá el remitente por uno propio, por ejemplo:
-- 'Servicio Tecnico Walter Molares <no-reply@TU_DOMINIO_VERIFICADO>'
`

const prueba = `-- Prueba directa: envía un correo a tu email de admin.
do $$
declare
  v_key text;
  v_from text;
begin
  select decrypted_secret into v_key
    from vault.decrypted_secrets where name = 'RESEND_API_KEY';

  select decrypted_secret into v_from
    from vault.decrypted_secrets where name = 'RESEND_FROM';

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', v_from,
      'to', jsonb_build_array('waltermolares68@gmail.com'),
      'subject', 'Prueba de aviso - Walter Molares',
      'html', '<p>Si llegó, Resend funciona.</p>'
    )
  );
end $$;
`

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SQL para copiar - Servicio Tecnico Walter Molares</title>
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; background: #f6f8fb; color: #0f172a; }
  main { max-width: 1100px; margin: 0 auto; padding: 28px 18px 60px; }
  h1 { font-size: 1.6rem; margin: 0 0 6px; }
  p.intro { color: #475569; margin: 0 0 24px; }
  section { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; margin-bottom: 22px; overflow: hidden; box-shadow: 0 1px 2px rgba(15,23,42,.04); }
  .head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 18px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
  .head h2 { font-size: 1.05rem; margin: 0; }
  .head small { display: block; color: #64748b; font-weight: 400; margin-top: 3px; }
  button { border: 0; border-radius: 9px; background: #0f766e; color: #fff; font-weight: 700; font-size: .9rem; padding: 9px 16px; cursor: pointer; white-space: nowrap; }
  button:hover { background: #0b5f59; }
  button.copiado { background: #16a34a; }
  pre { margin: 0; padding: 18px; max-height: 500px; overflow: auto; background: #0b1220; color: #e2e8f0; font: 12.5px/1.55 ui-monospace, SFMono-Regular, Consolas, monospace; tab-size: 2; }
  code { white-space: pre; }
  .nota { padding: 12px 18px; background: #fffbeb; color: #92400e; font-size: .88rem; border-top: 1px solid #fde68a; }
</style>
</head>
<body>
<main>
  <h1>SQL para Supabase</h1>
  <p class="intro">Servicio Tecnico Walter Molares. Tocá «Copiar», pegalo en Supabase → SQL Editor y ejecutalo.</p>

  <section>
    <div class="head">
      <div>
        <h2>1. Esquema completo (corregido)</h2>
        <small>Créditos decimales, compras pendientes, credenciales y avisos por email al admin y al cliente. No borra datos.</small>
      </div>
      <button type="button" onclick="copiar('esquema', this)">Copiar</button>
    </div>
    <pre><code id="esquema">${esc(esquema)}</code></pre>
  </section>

  <section>
    <div class="head">
      <div>
        <h2>2. Parche rápido si te dio error 42P13</h2>
        <small>Solo corrige la función del saldo.</small>
      </div>
      <button type="button" onclick="copiar('parche', this)">Copiar</button>
    </div>
    <pre><code id="parche">${esc(parche)}</code></pre>
  </section>

  <section>
    <div class="head">
      <div>
        <h2>3. Correo de aviso (Resend)</h2>
        <small>Reemplazá solo la clave. El remitente se deja así para probar.</small>
      </div>
      <button type="button" onclick="copiar('secretos', this)">Copiar</button>
    </div>
    <pre><code id="secretos">${esc(secretos)}</code></pre>
  </section>

  <section>
    <div class="head">
      <div>
        <h2>4. Probar el correo</h2>
        <small>Envía un correo de prueba a waltermolares68@gmail.com.</small>
      </div>
      <button type="button" onclick="copiar('prueba', this)">Copiar</button>
    </div>
    <pre><code id="prueba">${esc(prueba)}</code></pre>
    <div class="nota">Si este correo llega pero el aviso de compra no, el problema está en el disparador, no en Resend.</div>
  </section>
</main>
<script>
async function copiar(id, boton) {
  const texto = document.getElementById(id).innerText;
  try {
    await navigator.clipboard.writeText(texto);
  } catch (e) {
    const area = document.createElement('textarea');
    area.value = texto;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
  boton.textContent = '¡Copiado!';
  boton.classList.add('copiado');
  setTimeout(function () {
    boton.textContent = 'Copiar';
    boton.classList.remove('copiado');
  }, 1800);
}
</script>
</body>
</html>
`

fs.writeFileSync(path.join(base, 'SQL_PARA_COPIAR.html'), html, 'utf8')
console.log('HTML generado correctamente')
