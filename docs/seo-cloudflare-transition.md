# Política SEO vigente: Cloudflare como URL oficial temporal

Actualizada el 30 de octubre de 2026 por decisión del responsable de ForgeLock. La URL oficial temporal es `https://forgelock.forge-look19.workers.dev/` hasta conseguir la primera venta. Esta decisión autoriza los cambios locales de canonicals y señales SEO; no autoriza publicación ni cambios en GitHub Pages, Workers Builds, GitHub Actions, DNS o cuentas.

| Variante | Salida | Canonical y señales sociales | Indexación |
|---|---|---|---|
| Cloudflare Worker oficial temporal | `dist-cloudflare/` | `https://forgelock.forge-look19.workers.dev/`, rutas sin `.html` | Portada y servicios indexables y en sitemap; legales, 404 y ejemplos conceptuales con noindex |
| GitHub Pages | `dist/` | Su URL y rutas `.html` propias al construir esa variante | Portada y servicios indexables y en sitemap; legales y 404 con noindex |

`SEO_TARGET` selecciona destino y canonical en conjunto. `BASE_URL`, si se proporciona, debe coincidir exactamente con el destino seleccionado. La generación adapta canonical, hreflang, Open Graph, Twitter y JSON-LD por destino. La navegación del Worker usa rutas sin `.html`. Los cuatro ejemplos se copian como HTML independiente, quedan fuera del sitemap y llevan `noindex`.

## Protecciones y validación

- Ambos destinos son indexables por defecto; `INDEXABLE=false` permite crear artefactos no indexables con sitemap vacío.
- `SEO_TRANSITION` y el comando heredado `npm run build:dist:pages-transition` siguen bloqueados.
- No se sobrescriben directorios de salida existentes. Ejecuta los builds en carpetas temporales vacías para validar sin tocar artefactos previos.
- `npm run build:dist:cloudflare` y `npm run validate:dist:cloudflare` verifican el artefacto del Worker; `npm test` comprueba las dos variantes.
- Los resultados de builds locales no confirman el estado del Worker remoto ni el envío/aceptación de su sitemap en Search Console.

El ajuste SEO de los archivos fuente y de la generación local no sube cambios ni despliega. Antes de publicar el Worker se debe revisar el trigger remoto descrito en [configuración Cloudflare pendiente](configuracion-cloudflare-pendiente.md). El workflow de GitHub Pages no se modifica en esta tarea.
