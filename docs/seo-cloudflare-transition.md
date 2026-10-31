# Política SEO vigente: Cloudflare como URL oficial temporal

Actualizada el 30 de octubre de 2026 por decisión del responsable de ForgeLock. La URL oficial temporal es `https://forgelock.forge-look19.workers.dev/` hasta conseguir la primera venta. El 31 de octubre de 2026 se autorizó y verificó el despliegue manual del Worker desde la rama de auditoría. Esto no autorizó cambios en GitHub Pages, Workers Builds, GitHub Actions, DNS o cuentas.

| Variante | Salida | Canonical y señales sociales | Indexación |
|---|---|---|---|
| Cloudflare Worker oficial temporal | `dist-cloudflare/` | `https://forgelock.forge-look19.workers.dev/`, rutas sin `.html` | Todas las páginas con `noindex`; sitemap vacío y sin directiva Sitemap en robots.txt |
| GitHub Pages | `dist/` | `https://forgelock-solution.github.io/ForgeLock/` y rutas `.html` | Portada, servicios y fichas piloto indexables y en sitemap; legales y 404 con noindex |

`SEO_TARGET` selecciona destino y canonical en conjunto. `BASE_URL`, si se proporciona, debe coincidir exactamente con el destino seleccionado. La generación adapta canonical, hreflang, Open Graph, Twitter y JSON-LD por destino. La navegación del Worker usa rutas sin `.html`. Los cuatro ejemplos se copian como HTML independiente, quedan fuera del sitemap y llevan `noindex`.

## Protecciones y validación

- Pages es indexable por defecto; `INDEXABLE=false` permite crear un artefacto Pages no indexable con sitemap vacío.
- Cloudflare permanece siempre `noindex,follow`, con sitemap vacío y robots.txt sin directiva Sitemap. `INDEXABLE=true` se rechaza.
- `SEO_TRANSITION` y el comando heredado `npm run build:dist:pages-transition` siguen bloqueados.
- No se sobrescriben directorios de salida existentes. Ejecuta los builds en carpetas temporales vacías para validar sin tocar artefactos previos.
- `npm run build:dist:cloudflare` y `npm run validate:dist:cloudflare` verifican el artefacto del Worker; `npm test` comprueba las dos variantes.
- Los resultados de builds locales no confirman el estado del Worker remoto ni el envío/aceptación de su sitemap en Search Console.

El despliegue manual del Worker se verificó el 31 de octubre de 2026. No se cambió el trigger remoto ni el workflow de GitHub Pages; cualquier automatización futura requiere revisar por separado la [configuración Cloudflare](configuracion-cloudflare-pendiente.md). El flujo de Pages conserva su publicación desde `main`.
