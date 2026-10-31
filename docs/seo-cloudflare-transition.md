# Política SEO: GitHub Pages oficial y Cloudflare secundario

Actualizada el 31 de octubre de 2026. La URL oficial y canónica de ForgeLock es `https://forgelock-solution.github.io/ForgeLock/`. GitHub Pages es la única versión indexable y la única que publica un sitemap con páginas. Cloudflare se conserva como entorno secundario de pruebas en `https://forgelock.forge-look19.workers.dev/`.

| Variante | Salida | Señales canónicas y sociales | Rastreo e indexación |
|---|---|---|---|
| GitHub Pages oficial | `dist/` | URLs de GitHub Pages, rutas `.html` | Rastreo permitido; páginas públicas indexables en sitemap; páginas legales, ejemplos y 404 con `noindex` |
| Cloudflare secundario | `dist-cloudflare/` | Conserva las URLs canónicas, Open Graph, Twitter y JSON-LD de GitHub Pages | Rastreo permitido para leer `noindex`; todas las páginas `noindex,follow`; sitemap vacío; sin directiva Sitemap en robots.txt; cabecera HTTP `X-Robots-Tag: noindex, follow` |

`SEO_TARGET` selecciona el alojamiento de salida. `BASE_URL`, si se proporciona, debe coincidir con ese destino. La URL canónica permanece fijada a GitHub Pages en los dos builds. El Worker adapta la navegación local a rutas sin `.html`, pero esas rutas no cambian las URLs canónicas públicas.

La portada, servicios y fichas individuales públicas de servicios son indexables en Pages y entran al sitemap si sus canonicals son propios. Las tres páginas legales, los cuatro ejemplos conceptuales y la página 404 son `noindex` y no entran al sitemap. `lastmod` solo se emite si Git aporta una fecha real válida para ese archivo. Robots permite rastrear ambos destinos; no se debe bloquear Cloudflare en `robots.txt`, ya que los motores necesitan leer su directiva `noindex`.

## Validación local

- `npm test` prueba ambos builds en directorios temporales aislados.
- `npm run build:dist` y `npm run validate:dist` validan GitHub Pages.
- `npm run build:cloudflare` y `npm run validate:dist:cloudflare` validan Cloudflare.
- Los builds no publican cambios ni confirman el estado remoto.

## Cloudflare pendiente

El archivo `_headers` y el middleware del Worker preparan `X-Robots-Tag: noindex, follow` para la próxima publicación autorizada. Los metadatos `noindex,follow` ya forman parte del HTML del artefacto. No desplegar ni cambiar Workers Builds como parte de esta auditoría. Confirmar en una publicación futura que la respuesta del Worker incluya la cabecera y que sus HTML mantengan `noindex`.

El modo histórico `SEO_TRANSITION` y `npm run build:dist:pages-transition` siguen deshabilitados. Una futura migración a dominio propio requiere una decisión separada, cambio de canonicals/sitemap, redirecciones, pruebas y actualización de Search Console.

## Search Console

El sitemap publicado es `https://forgelock-solution.github.io/ForgeLock/sitemap.xml`. Para registrarlo manualmente: abre la propiedad de prefijo URL `https://forgelock-solution.github.io/ForgeLock/` en Search Console, entra a **Sitemaps**, ingresa `sitemap.xml` y pulsa **Enviar**. Después usa **Inspección de URLs** para revisar `https://forgelock-solution.github.io/ForgeLock/` y `https://forgelock-solution.github.io/ForgeLock/servicios.html`; solicita indexación si Search Console ofrece esa opción. La respuesta HTTP 200 y la canonical solo comprueban disponibilidad y señales declaradas, no confirman indexación. Revisa el estado del sitemap después de que Google lo procese.

El conector GSC Wizard no estuvo disponible durante la auditoría porque la cuenta conectada no tiene una suscripción activa; no se pudo consultar ni enviar el sitemap desde esa integración.
