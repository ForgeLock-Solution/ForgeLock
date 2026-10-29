# Auditoría y preparación de Cloudflare Pages

> Documento histórico. La política vigente de la fase 1 conserva GitHub Pages como producción y Cloudflare como pruebas no indexables; véase la [política SEO](seo-cloudflare-transition.md). Los procedimientos de migración de esta auditoría no están autorizados.

Fecha: 23 de octubre de 2026  
Rama: `chore/cloudflare-pages-prep`  
Commit base: `b0b9f30`  
Estado: preparación local; no se creó infraestructura ni se publicó una versión.

## Resumen

ForgeLock es un sitio estático HTML/CSS/JavaScript con módulos MVC vanilla. El build ya produce `dist/` y la configuración `wrangler.toml` declara `npm run build:dist` como compilación y `dist/` como salida. Las pruebas iniciales y el build pasan. Cloudflare Pages es compatible con la estructura existente sin añadir un framework ni un servidor.

No se puede declarar completada la migración: no hay conexión autorizada a la cuenta de Cloudflare, al proyecto de Supabase ni a Google Search Console en esta sesión. Tampoco se conoce el dominio de producción de Cloudflare. GitHub Pages sigue siendo el destino configurado y su workflow publica automáticamente al llegar un cambio a `main`.

## Estado inicial

- El checkout inicial estaba limpio en `main`, alineado con `origin/main`, en `b0b9f30`.
- `origin` apunta a `https://github.com/ForgeLook19/forge_look.git`; el repositorio indicado en la solicitud usa el nombre `ForgeLock-Solution/ForgeLock`. Confirmar si es el mismo repositorio renombrado antes de configurar una integración Git.
- El historial incluye `main` y el commit es compartido también por una rama local de marca; la preparación se aisló en una rama de trabajo separada.
- Hay un `.env` local ignorado y no versionado con nombres de variables de Supabase, incluida una variable de clave privilegiada. No se registraron ni copiaron sus valores. La compilación usa una lista de archivos y no copia `.env`.

## Inventario confirmado

- Sitio: HTML estático, Tailwind CSS, JavaScript vanilla organizado en `src/models`, `src/views`, `src/controllers` y `src/services`.
- Build: npm, Node.js `>=20 <25`, Tailwind y `scripts/create-dist.mjs`; incluye documentos legales, 404, manifiesto, iconos, recursos y módulos del navegador.
- Supabase: hay dos migraciones SQL para `public.leads`, un cliente de navegador futuro y un script separado para publicar contenido en Storage. El controlador actual conserva el flujo de WhatsApp y no importa el cliente de Supabase; por tanto, no se verificó ni se necesita una conexión Supabase para la landing observada.
- SEO: home y servicios son candidatas a indexación; las tres páginas legales y la 404 indican `noindex`. `BASE_URL` se aplicaba a `robots.txt` y sitemap; las etiquetas HTML seguían fijadas a GitHub Pages.
- HTTP: `_headers` establece `nosniff`, política de referrer, frame y permisos; deja CSP pendiente deliberadamente. HTML usa `no-cache`; recursos sin hash tienen una caché de un día.
- CI: `deploy-pages.yml` ejecuta instalación, tests y build antes de publicar `dist/` en GitHub Pages en `main`. `validate-dist.yml` valida en PR, pero el workflow de Pages sigue siendo un segundo publicador.
- Analítica: home y servicios difieren de 404. La 404 cargaba GTM en el HTML antes de comprobar la preferencia, aunque GA4 se condicionaba a consentimiento.

## Hallazgos clasificados

### Alto

- **Riesgo de consentimiento en 404:** el snippet y el iframe sin JavaScript de GTM se insertaban antes de comprobar `forgelock_analytics_consent`. Así, una visita directa a 404 podía iniciar una etiqueta sin consentimiento. Se corrigió en esta rama para cargar GTM y GA4 únicamente si existe consentimiento aceptado, y se añadió una comprobación automatizada.
- **Dos rutas de publicación:** el workflow actual despliega a GitHub Pages en `main`. Si se activa un proyecto Pages con integración Git sin coordinar el flujo, ambos hosts se publicarían independientemente. No se cambió el workflow de producción en esta preparación.
- **Despliegue Supabase privilegiado:** `deploy-to-supabase-storage.mjs` usa service role y puede crear un bucket público y subir archivos. El script no es parte del build y no se ejecutó. Debe tratarse como herramienta administrativa separada; nunca debe invocarse desde el navegador o el pipeline público de Pages.

### Medio

- **Base SEO incompleta:** el generador atendía `BASE_URL` para robots y sitemap, pero canonical, Open Graph y JSON-LD seguían en GitHub Pages. También reescribía los archivos fuente `robots.txt` y `sitemap.xml` durante el build. Se ajustó esta rama para concretar las URLs HTML en `dist/` y escribir robots/sitemap solo dentro del artefacto. El dominio definitivo continúa pendiente.
- **Dependencias de desarrollo:** `npm ci` reportó 7 vulnerabilidades en el árbol completo (4 moderadas y 3 altas). Los paquetes afectados son `compression`, `fast-uri`, `postcss-nested`, `postcss-selector-parser`, `serve`, `source-map-js` y `tailwindcss`; `npm audit --omit=dev` reportó cero vulnerabilidades de producción. Algunas correcciones propuestas implican actualizar a Tailwind 4 o cambios mayores; no se ejecutó `npm audit fix`.
- **Versionado de caché:** fuentes, CSS e imágenes no tienen hash en nombre y se sirven con un día de caché. Revalidar después de confirmar la estrategia de invalidación/versionado del sitio.
- **Workflow de validación duplicado:** ambos workflows ejecutan pruebas y compilación en PR. Consolidar CI de validación después de decidir el único publicador.

### Bajo

- El build mostró el aviso de `caniuse-lite` desactualizado; no impidió la compilación.
- La URL del repositorio configurada en Git no coincide textualmente con la indicada en la solicitud.

## Línea base ejecutada

| Comando | Resultado real | Notas |
|---|---|---|
| `npm ci` | Aprobado; 206 paquetes instalados | 7 vulnerabilidades de desarrollo y producción combinadas: 4 moderadas, 3 altas. Advertencia de paquete `whatwg-encoding` deprecado. Se ejecutó en el worktree de auditoría para preservar el `node_modules` existente. |
| `npm test` | Aprobado; 17/17 | Incluye pruebas de accesibilidad, MVC, enlaces, servicios y consentimiento. |
| `npm run build:dist` | Aprobado | Generó `dist/` y pasó la validación incorporada. Aviso de `caniuse-lite` desactualizado. |
| `npm run validate:dist` | Aprobado | Manifiesto, iconos, sitemap y archivos esenciales válidos. |
| `npm audit --omit=dev` | Aprobado; 0 vulnerabilidades de producción | No equivale a una auditoría total de dependencias de desarrollo. |

El build también actualiza copias vendorizadas de fuentes e iconos y, antes del ajuste de esta rama, reescribía los archivos SEO fuente. Esos cambios generados se retiraron del árbol de trabajo tras registrar el resultado; la salida `dist/` se conserva como artefacto ignorado.

Después de los cambios locales, `npm test` aprobó 18/18; `npm run build:dist` y `npm run validate:dist` aprobaron con el `BASE_URL` actual. Se comprobó además `BASE_URL=https://forge.example/` (canonicals, sitemap y robots en la raíz y sin modificar los fuentes) e `INDEXABLE=false` (sin URLs de sitemap y con `noindex` en todas las páginas del artefacto). `forge.example` fue un valor ficticio de prueba, no un dominio real ni una publicación.

## Cloudflare Pages

No se pudo verificar la cuenta, proyectos, dominios, despliegues, variables o controles de rama porque no hay una sesión o conector de Cloudflare disponible. La ausencia de herramientas no prueba que no haya acceso ni que no exista un proyecto.

Configuración candidata, aún sin aplicar:

- Build command: `npm run build:dist`
- Build output directory: `dist`
- Node.js: una versión compatible con `package.json` (`20` a `24`); fijar la misma versión en Pages y CI.
- Build variables: `BASE_URL`, con URL HTTPS del host canónico solo después de confirmarlo, e `INDEXABLE=false` para vistas previas y el host temporal `*.pages.dev`. Establecer `INDEXABLE=true` únicamente para el dominio de producción verificado.
- Mantener Pages Functions desactivadas mientras no se identifique una función de backend necesaria.
- Mantener las vistas previas con `noindex`; el dominio temporal `*.pages.dev` debe documentarse tras crear el proyecto.

### Alternativas de publicación

**Recomendación: Wrangler desde GitHub Actions como único publicador de producción**, si se configuran credenciales restringidas a Pages y el proyecto. Permite que el job de despliegue dependa explícitamente de `npm ci`, tests, build y validación; además, cada despliegue queda asociado al SHA y puede revertirse a un artefacto/commit anterior. Requiere crear un proyecto Direct Upload, añadir `wrangler` y proteger `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` en GitHub Actions. No se implementó ni ejecutó el despliegue.

La integración Git nativa de Cloudflare ofrece previews y estados de build en PR. Si se elige, se debe exigir el check de GitHub Actions antes de permitir merges a la rama de producción y configurar Cloudflare para desplegar solo esa rama. Si las políticas de rama no son obligatorias, Pages puede publicar el commit aunque el workflow de pruebas falle. No mantener ambos métodos publicando producción.

La documentación oficial confirma que la integración Git genera URLs de preview por PR y ejecuta cambios de ramas configuradas; Pages también permite especificar el comando de build, salida y variables de entorno. [Integración GitHub](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/) · [Configuración de build](https://developers.cloudflare.com/pages/configuration/build-configuration/).

## Supabase

El código y las migraciones confirman la intención de crear `public.leads` con validación de entrada y RLS para inserciones anónimas, pero no demuestran que esas migraciones estén aplicadas ni que la tabla, políticas, Auth, Storage o funciones existan ahora. No se consultó la API ni se intentó una conexión con una clave privilegiada. El estado `INACTIVE` indicado en el encargo sigue sin revalidarse; no reactivar ni sustituir el proyecto sin autorización.

## SEO, Search Console y dominio

- Las páginas principales tienen canonicals absolutos de GitHub Pages en el commit base. Las páginas legales y 404 tienen `noindex`.
- El sitemap local contiene dos URLs y el robot apunta al sitemap de GitHub Pages. El build valida la estructura local, no el acceso en producción.
- El generador permite `INDEXABLE=false`: añade `noindex` a las páginas que no lo declaran y omite las URLs del sitemap. Cloudflare también añade `X-Robots-Tag: noindex` a despliegues de preview; la configuración real debe confirmarse en el primer preview. La documentación de Cloudflare describe esa cabecera por defecto en previews ([preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)).
- La home, `sitemap.xml` y `robots.txt` de GitHub Pages respondieron `200` en consulta pública; el canonical servido por la home coincide con la URL actual de GitHub Pages. Esto verifica disponibilidad y publicación, no que Google haya aceptado el sitemap.
- No se pudo consultar Search Console, ni verificar rastreo, descubrimiento, canonical seleccionado o indexación. Google indica que el envío del sitemap es una pista y no garantiza descarga o indexación ([documentación de Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)).
- No cambiar el dominio canónico ni retirar GitHub Pages hasta que el dominio de Pages esté confirmado, el preview pase pruebas, se publiquen redirects válidos, los checks de Search Console estén disponibles y el dueño apruebe el corte.
- En el corte: mantener una única URL canónica, redirigir las rutas antiguas a sus equivalentes con 301, actualizar canonical/OG/JSON-LD/robots/sitemap y enviar el nuevo sitemap en Search Console. Mantener temporalmente el hosting anterior durante la verificación.

## Seguridad y analítica

- La compilación selecciona los archivos que publica; no copia `.env`, `node_modules`, `scripts` ni migraciones SQL. El validador ahora también falla si aparece un archivo `.env*` o `src/config/supabase-config.js` en `dist/`.
- No se halló una `SUPABASE_SERVICE_ROLE_KEY` dentro del artefacto. El código de cliente incluye el nombre de la variable solo en comentarios explicativos; eso no es una clave ni un valor.
- Se mantiene la CSP sin configurar hasta identificar todos los orígenes y validar consentimiento, analítica y recursos.
- La home y servicios tienen pruebas de que GTM/GA4 esperan consentimiento. No se pudo comprobar configuración de etiquetas dentro del contenedor GTM, duplicación de GA4, eventos en vivo, ni la preferencia almacenada en un navegador real.
- `404.html` ahora difiere GTM y GA4 hasta leer una preferencia aceptada; cuando `localStorage` está bloqueado, no inicia analítica.

## Pruebas pendientes y bloqueos

- Bloqueadas por acceso: inventario de Cloudflare, estado real de Supabase y su esquema/configuración, dominio temporal, cabeceras HTTP publicadas y despliegues activos.
- Bloqueadas por acceso de propietario: creación de proyecto, conexión de repositorio, secretos, DNS, rama de producción y aprobación de transición.
- No verificadas: Search Console, indexación, reproducción visual en dispositivo, cabeceras/redirecciones remotas, tamaño del sitemap servido y disponibilidad de recursos remotos de terceros.

## Rollback y producción

1. Conservar GitHub Pages durante las pruebas de Cloudflare.
2. Registrar SHA del artefacto validado y URL de preview; probar páginas, recursos, consentimiento y 404 bajo la raíz.
3. Publicar solo tras aprobación del propietario y comprobar HTTPS, headers, sitemap y logs de error.
4. Para revertir, volver a desplegar el SHA/artefacto Pages anterior y restaurar el enrutamiento al host anterior; no borrar el proyecto ni los datos de Supabase.
5. Desactivar el publicador de GitHub Pages solo cuando Cloudflare esté validado en el dominio definitivo y se confirme la reversión.

No se ejecutó una reversión porque no se hizo un despliegue real.
