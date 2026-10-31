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

GitHub Pages es el sitio oficial y canónico en `https://forgelock-solution.github.io/ForgeLock/`. `npm run build:dist` genera en `dist/` la variante Pages. `npm run build:dist:cloudflare` genera en `dist-cloudflare/` un entorno secundario de pruebas para `https://forgelock.forge-look19.workers.dev/`; `wrangler.toml` declara esa segunda salida. Ningún build reemplaza una salida que ya contenga archivos: conserva los artefactos existentes y usa `DIST_DIR` con una carpeta temporal vacía para validar.

`SEO_TARGET` selecciona `github-pages` o `cloudflare`. `BASE_URL`, si se proporciona, identifica el alojamiento y debe coincidir exactamente con el destino, incluida la barra final. Las URLs canonical, hreflang, Open Graph, Twitter Cards y JSON-LD siempre usan GitHub Pages en ambas variantes. El Worker adapta la navegación relativa a sus rutas sin `.html`, pero la canonical de servicios sigue siendo `/ForgeLock/servicios.html`.

Cloudflare siempre genera todas sus páginas con `noindex,follow`, un sitemap sin URLs, un `robots.txt` sin directiva Sitemap y una cabecera `X-Robots-Tag: noindex, follow`. Se permite rastrear para que los motores lean `noindex`. `INDEXABLE=true` se rechaza para Cloudflare. Pages conserva su sitemap indexable con `lastmod` obtenido de Git; `INDEXABLE=false` permite construir una variante Pages no indexable.

Valida Pages con `npm run validate:dist` y el Worker con `npm run validate:dist:cloudflare`, usando el mismo `DIST_DIR` que al construir. El validador comprueba la canonical de Pages, la preservación de las señales SEO fuente en el Worker, `noindex`, el sitemap vacío y la verificación de Google. `npm test` construye en carpetas temporales, rechaza regresiones SEO y comprueba que fuentes y distribuciones existentes no cambien. Si Wrangler está instalado y Node es compatible, también prueba las rutas mediante un preview local; esto no verifica el Worker remoto.

El comando previsto para publicar en una fase posterior es `npm run deploy:cloudflare`. Reutiliza `build-dist.mjs cloudflare`, que construye y valida un artefacto temporal aislado, y, si se autoriza explícitamente, publica exactamente ese mismo artefacto. La configuración temporal conserva el contenido de `wrangler.toml`, incluidos `previews` y sus opciones; solo sustituye la ruta de activos por `./assets`. Wrangler es una dependencia local fijada en `package.json` y `package-lock.json`; se invoca mediante Node, sin instalación global ni búsqueda en `PATH`. Wrangler 4.155.0 requiere Node.js 22 o superior; usa Node.js `>=22 <25` para las operaciones de Wrangler, aunque el sitio y sus builds mantienen el mínimo Node.js 20. El preflight exige el `account_id` confirmado en `wrangler.toml`; sin él falla de forma segura. Sin `FORGELOCK_DEPLOY_CONFIRMATION`, el comando solo construye, valida y elimina el artefacto temporal. `FORGELOCK_DEPLOY_CONFIRMATION=deploy-forgelock` solo debe definirse justo al ejecutar el despliegue autorizado y eliminarse inmediatamente después. No copies sintaxis de PowerShell en CMD: usa el bloque correspondiente y ejecuta sus líneas en la misma terminal, solo después de confirmar el `account_id` y autorizar la publicación.

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

GitHub Pages es el sitio oficial y canónico; Cloudflare permanece como entorno secundario no indexable. `SEO_TRANSITION` y el comando heredado `npm run build:dist:pages-transition` siguen deshabilitados. Los cambios SEO locales no publican el Worker ni modifican GitHub Pages. Consulta la [política SEO vigente](docs/seo-cloudflare-transition.md).

Los cambios locales de las fases 1 y 2 no actualizan Workers Builds, GitHub Actions ni el Worker publicado. Antes de cualquier push, confirma el [ajuste remoto pendiente](docs/configuracion-cloudflare-pendiente.md); el trigger remoto auditado ejecuta Wrangler directamente y no utiliza el preflight de este repositorio.

`docs/seo-audit.md` y `docs/cloudflare-pages-migration-audit.md` conservan auditorías anteriores; sus resultados no equivalen a verificaciones actuales.

