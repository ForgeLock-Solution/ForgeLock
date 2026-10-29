# ForgeLock

Landing estática de servicios tecnológicos para emprendedores, negocios y pequeñas empresas.

## Descripción

ForgeLock presenta soluciones de automatización, desarrollo web, sistemas y digitalización de procesos. La app mantiene una arquitectura MVC simple en JavaScript vanilla y se despliega como sitio estático.

## Tecnologías

- HTML, CSS y JavaScript vanilla
- Tailwind CSS
- Node.js y npm para desarrollo, build y pruebas
- Supabase para almacenamiento y, opcionalmente, registro de leads
- Arquitectura MVC frontend sin backend permanente

## Requisitos

- Node.js `>=20 <25`
- npm

## Instalación

```bash
npm ci
```

## Variables de entorno

`SUPABASE_URL` identifica el proyecto y `SUPABASE_BUCKET` el destino de Storage. `SUPABASE_SERVICE_ROLE_KEY` es privada y solo puede usarse en un proceso seguro de servidor. Este repositorio no contiene actualmente un workflow de despliegue a Supabase.

Nunca publiques:

- `.env`
- `.env.*`
- `src/config/supabase-config.js`
- claves privadas, passwords o tokens

## Desarrollo local

```bash
npm run dev
```

Abre la aplicación en:

```text
http://localhost:3001/
```

No abras la app directamente con `file:///` porque los módulos ES requieren un servidor HTTP.

## Build

```bash
npm run build
npm run build:dist
```

`build` mantiene el flujo de mantenimiento existente: refresca assets desde `node_modules` y compila el stylesheet fuente. Puede modificar archivos versionados de `src/vendor` y `src/styles`; no lo usan CI, tests ni los builds SEO. `build:dist` genera la variante Pages en `dist/`, compila Tailwind en la salida y copia los assets vendorizados ya versionados, sin escribir en los fuentes.

## Tests

```bash
npm test
```

La suite valida el render de la landing y la persistencia del borrador del formulario sin romper la estructura MVC. Las pruebas SEO construyen en directorios temporales y los eliminan al terminar, sin reemplazar un `dist/` existente. La prueba HTTP de Workers Static Assets solo se ejecuta si Wrangler está instalado localmente.

## Supabase

Las migraciones versionadas definen la tabla `public.leads` y políticas de inserción con Row Level Security; eso no confirma que estén aplicadas en el proyecto remoto. El frontend no usa actualmente el cliente Supabase y la landing sigue abriendo WhatsApp sin guardar leads. Si se activa esa escritura en el futuro, solo se usará la URL pública y la anon key con RLS correctamente configurado, nunca una clave privada.

## Deployment

GitHub Pages publica el sitio estático generado en `dist/`. También existe un script opcional para subir `dist/` a Supabase Storage, pero no hay un workflow de GitHub Actions que lo ejecute. El script usa `SUPABASE_SERVICE_ROLE_KEY` y puede crear un bucket público si el nombre indicado no existe; no lo ejecutes hasta verificar el proyecto y el destino desde una sesión autorizada.

```bash
npm run build:dist
npm run deploy:supabase
```

## Seguridad

- La clave privada no se usa en el navegador.
- La configuración pública queda separada del entorno de despliegue seguro.
- El sitio no debe publicar secretos ni credenciales reales en HTML, CSS, JS ni `dist/`.
- Si se decide guardar leads desde la landing, la activación debe hacerse de forma explícita y validada.


## SEO técnico

La generación SEO usa dos destinos y dos salidas separadas. `npm run build:dist` conserva GitHub Pages como valor predeterminado y genera en `dist/` la base `https://forgelock-solution.github.io/ForgeLock/`, incluida su subruta `/ForgeLock/`. `npm run build:dist:cloudflare` genera en `dist-cloudflare/` la variante Worker con base `https://forgelock.forge-look19.workers.dev/`. `wrangler.toml` declara únicamente `dist-cloudflare/`. Ningún build reemplaza una salida que ya contenga archivos: inspecciona el artefacto existente y usa una carpeta temporal vacía para validar sin sobrescribirlo.

`SEO_TARGET` puede fijarse explícitamente a `github-pages` o `cloudflare`. Para Cloudflare, `BASE_URL` debe ser `https://forgelock.forge-look19.workers.dev/`, incluida la barra final; cualquier valor explícito debe coincidir exactamente con el destino seleccionado. Los HTML fuente conservan las canonicals de Pages. En la variante Worker, la configuración `html_handling = "auto-trailing-slash"` se valida en preview antes de depender de la ruta final `/servicios`; canonical, Open Graph, JSON-LD y sitemap deben corresponder con esa ruta. Pages conserva `/ForgeLock/servicios.html`. Las páginas legales mantienen `noindex` y quedan fuera del sitemap en ambos destinos.

Valida Pages con `npm run validate:dist` y el Worker con `npm run validate:dist:cloudflare`. `npm test` construye ambas variantes en una carpeta temporal y prueba que una distribución Pages falle la validación Worker. Si Wrangler está instalado, añade una prueba local de runtime; si no lo está, esa prueba se omite y no equivale a validar el preview real.

El comando previsto para publicar en una fase posterior es `npm run deploy:cloudflare`. Construye y valida un artefacto temporal aislado y, si se autoriza explícitamente, publica exactamente ese mismo artefacto mediante una configuración Wrangler temporal. Wrangler es una dependencia local fijada en `package.json` y `package-lock.json`; `npm ci` la instala y no hace falta una instalación global ni tenerla en `PATH`. Wrangler 4.155.0 requiere Node.js 22 o superior; usa Node.js `>=22 <25` para las operaciones de Wrangler, aunque el sitio y sus builds mantienen el mínimo Node.js 20. El preflight exige el `account_id` confirmado en `wrangler.toml`; sin él falla de forma segura. `FORGELOCK_DEPLOY_CONFIRMATION=deploy-forgelock` solo debe definirse justo al ejecutar el despliegue autorizado y eliminarse inmediatamente después. La fase de publicación invoca `wrangler deploy` directamente; este comando no se ha ejecutado. No copies sintaxis de PowerShell en CMD: usa el bloque correspondiente y ejecuta sus líneas en la misma terminal, solo después de confirmar el `account_id` y autorizar la publicación.

CMD:

```cmd
set "FORGELOCK_DEPLOY_CONFIRMATION=deploy-forgelock"
npm run deploy:cloudflare
set "FORGELOCK_DEPLOY_CONFIRMATION="
```

PowerShell:

```powershell
$env:FORGELOCK_DEPLOY_CONFIRMATION = 'deploy-forgelock'
try {
  npm run deploy:cloudflare
} finally {
  Remove-Item Env:FORGELOCK_DEPLOY_CONFIRMATION -ErrorAction SilentlyContinue
}
```

## Transición de canonical

La variante Pages de transición se genera en una carpeta temporal con `npm run build:dist:pages-transition`; conserva las rutas de recursos y navegación bajo `/ForgeLock/`, pero dirige las señales canónicas a Cloudflare. Antes de cualquier publicación, sigue la secuencia y las verificaciones de [docs/seo-cloudflare-transition.md](docs/seo-cloudflare-transition.md). Mantén ambos artefactos independientes. GitHub Pages no se debe tratar como si admitiera las reglas `_redirects` del Worker; no se presupone una redirección permanente desde Pages. No solicites indexación ni envíes el sitemap a Search Console hasta que ambos hosts públicos sean coherentes.

Revisa `docs/seo-audit.md` para el estado previo de la auditoría.
