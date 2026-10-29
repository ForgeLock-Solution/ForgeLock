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

La producción y la URL canónica siguen siendo `https://forgelock-solution.github.io/ForgeLock/`. `npm run build:dist` genera en `dist/` la variante GitHub Pages. `npm run build:dist:cloudflare` genera en `dist-cloudflare/` un entorno de pruebas para `https://forgelock.forge-look19.workers.dev/`; `wrangler.toml` declara esa segunda salida. Ningún build reemplaza una salida que ya contenga archivos: conserva los artefactos existentes y usa `DIST_DIR` con una carpeta temporal vacía para validar.

`SEO_TARGET` selecciona `github-pages` o `cloudflare`. `BASE_URL`, si se proporciona, identifica el alojamiento y debe coincidir exactamente con el destino, incluida la barra final. No selecciona la URL canónica: canonical, hreflang, Open Graph, Twitter Cards y JSON-LD conservan las señales de GitHub Pages en ambas variantes. El Worker adapta únicamente la navegación relativa a sus rutas sin `.html`; la canonical de servicios sigue siendo `/ForgeLock/servicios.html` en producción.

Cloudflare siempre genera todas sus páginas con `noindex,follow`, un sitemap sin URLs y un `robots.txt` sin directiva Sitemap. Se permite rastrear para que los motores puedan leer `noindex`. `INDEXABLE=true` se rechaza para Cloudflare antes de crear la salida. Pages conserva su sitemap de producción, con `lastmod` obtenido de Git; `INDEXABLE=false` permite construir una variante Pages no indexable. Los HTML, robots y sitemap fuente no se reescriben.

Valida Pages con `npm run validate:dist` y el Worker con `npm run validate:dist:cloudflare`, usando el mismo `DIST_DIR` que al construir. El validador comprueba la canonical de Pages, la preservación de las señales SEO fuente en el Worker, `noindex`, el sitemap vacío y la verificación de Google. `npm test` construye en carpetas temporales, rechaza regresiones SEO y comprueba que fuentes y distribuciones existentes no cambien. Si Wrangler está instalado y Node es compatible, también prueba las rutas mediante un preview local; esto no verifica el Worker remoto.

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

## Canonical y migración deshabilitada

No hay una migración canónica autorizada. `SEO_TRANSITION` y el comando heredado `npm run build:dist:pages-transition` fallan antes de crear artefactos. Una migración futura requiere una decisión explícita sobre la URL final, revisión de generador, validadores y pruebas, y autorización separada para publicar. Consulta la [política SEO vigente](docs/seo-cloudflare-transition.md).

Los cambios locales de esta fase no actualizan Workers Builds, GitHub Actions ni el Worker publicado. Antes de cualquier push, revisa ambos publicadores y sus comandos; el trigger remoto auditado ejecuta Wrangler directamente y no utiliza el preflight de este repositorio.

`docs/seo-audit.md` y `docs/cloudflare-pages-migration-audit.md` conservan auditorías anteriores; sus resultados no equivalen a verificaciones actuales.
