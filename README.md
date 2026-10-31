# ForgeLock

Consulta la [especificación maestra](SPEC.md) y la [auditoría del 30 de octubre de 2026](docs/auditoria-maestra-2026-10-30.md).

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

El build reutiliza las vistas MVC en `scripts/render-home.mjs` para entregar las secciones de inicio en el HTML inicial y evitar saltos al cargar los módulos. Requiere las dependencias de desarrollo instaladas por `npm ci`, incluido JSDOM. Tailwind analiza todos los HTML públicos de la raíz y los módulos de `src/`; después de cambiar clases, ejecuta `npm run build:styles` para actualizar también el CSS versionado usado por `npm run dev`.

Inicio, servicios y 404 comparten `src/services/consent.js`. Inicio y servicios permiten cambiar la decisión desde «Preferencias de cookies»; revocar una aceptación recarga la página para descargar etiquetas activas. Los tests comprueban estados de consentimiento, eventos únicos y navegación por teclado. GA4 se configura directamente y GTM conserva su contenedor actual: cualquier etiqueta futura de GA4 en GTM debe revisarse para evitar una segunda configuración o eventos duplicados.

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

GitHub Pages es el sitio oficial y canonico: `https://forgelock-solution.github.io/ForgeLock/`. Cloudflare sigue como entorno secundario no indexable en `https://forgelock.forge-look19.workers.dev/`. El ultimo despliegue registrado del Worker precede a esta politica; este cambio no lo publica. El build local actualizado de Cloudflare adopta canonicals de Pages, `noindex`, sitemap vacio y `X-Robots-Tag`. `npm run build:dist` genera `dist/`; `npm run build:cloudflare` genera `dist-cloudflare/`. Ningun build reemplaza una salida que ya contenga archivos; usa `DIST_DIR` con una carpeta temporal vacia para validar.

`SEO_TARGET` selecciona la variante de alojamiento y `BASE_URL`, si se proporciona, debe coincidir exactamente con ella. Canonical, hreflang, Open Graph, Twitter Cards y JSON-LD siempre usan GitHub Pages en ambos builds. El Worker adapta la navegacion a rutas sin `.html`; Pages conserva las rutas con `.html`.

Cloudflare siempre genera todas sus páginas con `noindex,follow`, un sitemap sin URLs y un `robots.txt` sin directiva Sitemap. Se permite rastrear para que los motores puedan leer `noindex`. `INDEXABLE=true` se rechaza para Cloudflare antes de crear la salida. Pages conserva su sitemap de producción, con `lastmod` obtenido de Git; `INDEXABLE=false` permite construir una variante Pages no indexable. Los HTML, robots y sitemap fuente no se reescriben.

Valida Pages con `npm run validate:dist` y el Worker con `npm run validate:dist:cloudflare`. La validacion comprueba canonical y metadatos de Pages en ambas variantes, ademas de `noindex`, sitemap vacio, robots, `X-Robots-Tag`, Google verification y recursos. `npm test` construye ambas variantes en directorios temporales y, si Wrangler es compatible, prueba las rutas en preview; esto no verifica el Worker remoto.

El comando `npm run deploy:cloudflare` reutiliza `build-dist.mjs cloudflare`, construye y valida un artefacto temporal aislado y, si se autoriza explícitamente, publica exactamente ese mismo artefacto. La configuración temporal conserva el contenido de `wrangler.toml`, incluidos `previews` y sus opciones; solo sustituye la ruta de activos por `./assets`. Wrangler es una dependencia local fijada en `package.json` y `package-lock.json`; se invoca mediante Node, sin instalación global ni búsqueda en `PATH`. Wrangler 4.155.0 requiere Node.js 22 o superior; usa Node.js `>=22 <25` para las operaciones de Wrangler, aunque el sitio y sus builds mantienen el mínimo Node.js 20. El preflight exige el `account_id` de `wrangler.toml`; sin él falla de forma segura. Sin `FORGELOCK_DEPLOY_CONFIRMATION`, el comando solo construye, valida y elimina el artefacto temporal. `FORGELOCK_DEPLOY_CONFIRMATION=deploy-forgelock` solo debe definirse justo al ejecutar el despliegue autorizado y eliminarse inmediatamente después. No copies sintaxis de PowerShell en CMD: usa el bloque correspondiente y ejecuta sus líneas en la misma terminal.

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

## Canonical y migración deshabilitada

La política temporal de Cloudflare y Pages está documentada en la [política SEO vigente](docs/seo-cloudflare-transition.md). `SEO_TRANSITION` y el comando heredado `npm run build:dist:pages-transition` siguen deshabilitados: cada destino se compila y valida por separado.

El Worker `forgelock` se publica manualmente mediante `npm run deploy:cloudflare` con confirmacion explicita. La ultima auditoria registrada identifico la version `3776b071-3396-4379-bee5-9990ab4ee814` en `workers.dev`; esta actualizacion no modifica Workers Builds, DNS ni el Worker remoto. GitHub Actions publica Pages desde `main`. Consulta el estado registrado en [configuracion Cloudflare](docs/configuracion-cloudflare-pendiente.md).

`docs/seo-audit.md` y `docs/cloudflare-pages-migration-audit.md` conservan auditorías anteriores; sus resultados no equivalen a verificaciones actuales.

