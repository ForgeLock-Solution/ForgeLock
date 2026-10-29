# Política SEO vigente: GitHub Pages y pruebas en Cloudflare

Actualizada el 29 de octubre de 2026 durante la fase 1 autorizada. Sustituye el procedimiento anterior de transición canónica al Worker. No autoriza publicaciones ni cambios remotos.

## Producción preservada

La única URL canónica de producción es `https://forgelock-solution.github.io/ForgeLock/`. Se mantiene exactamente la marca ForgeLock. El Worker `https://forgelock.forge-look19.workers.dev/` se prepara como entorno de pruebas.

| Variante | Salida predeterminada | Canonical y señales sociales | Indexación |
|---|---|---|---|
| GitHub Pages | `dist/` | GitHub Pages, con `/ForgeLock/` y rutas `.html` | Portada y servicios en sitemap; legales y 404 con noindex |
| Cloudflare Worker de pruebas | `dist-cloudflare/` | Conserva canonical, hreflang, OG, Twitter y JSON-LD del fuente de Pages | Todas las páginas con noindex; sitemap vacío y robots sin Sitemap |

`BASE_URL` identifica el alojamiento del artefacto, no decide la canonical. Si se define, debe coincidir con `SEO_TARGET`. Los enlaces relativos del Worker se adaptan a las rutas de Static Assets; las URLs canónicas siguen identificando las páginas de producción.

## Protecciones locales

- `INDEXABLE=true` se rechaza para Cloudflare antes de crear la salida. El generador también rechaza ese intento si se invoca directamente desde JavaScript.
- Cualquier `SEO_TRANSITION` no vacío se rechaza. El comando heredado `npm run build:dist:pages-transition` termina con error sin generar artefactos.
- El validador rechaza señales SEO del Worker, cambios respecto al fuente en los metadatos del preview, páginas de prueba sin noindex y sitemaps de prueba con URLs.
- Se conserva el rastreo en robots para permitir leer noindex. No se publica una directiva Sitemap en el preview.
- El build no modifica los HTML, robots, sitemap ni estilos fuente. El cálculo de lastmod de Pages continúa usando Git.
- No se sobrescriben distribuciones existentes. Las pruebas usan salidas temporales y comprueban que los artefactos previos permanezcan intactos.

Estas protecciones corresponden al artefacto construido y validado. No corrigen retrospectivamente el `dist/` antiguo ni aseguran que el Worker remoto ya publique esos archivos.

## Validación y siguiente fase

Ejecutar `npm test` valida ambos destinos en carpetas temporales. El test runtime usa Wrangler local cuando está disponible y no publica cambios. Para builds manuales, seleccionar una carpeta temporal vacía mediante `DIST_DIR` y usar ese mismo valor al validar.

Antes de cualquier push o publicación, revisar Workers Builds y GitHub Actions por separado. En la auditoría del 29 de octubre el trigger remoto tenía `npm run build:dist` seguido de `npx wrangler deploy`, mientras Wrangler esperaba `dist-cloudflare/`. La fase 1 no modifica ese trigger, cuentas, dominios, DNS, secretos ni configuración remota.

Una futura migración necesita autorización específica sobre la URL final, un plan coordinado para ambos hosts, cambios revisados en generador y validadores y una comprobación de Search Console. No enviar un sitemap Worker ni solicitar indexación de ese entorno como parte de esta fase.
