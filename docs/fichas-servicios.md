# Fichas de servicios

Las fichas públicas se generan desde `SERVICE_CATALOG` mediante `src/views/service-fiche-view.js` y `scripts/render-service-fiches.mjs`. GitHub Pages publica ocho fichas individuales en `servicios/<slug>/index.html`, además de la portada y el catálogo general `servicios/index.html`.

El catálogo contiene un noveno servicio, **Desarrollo Web**. Se conserva en tarjetas y en la selección del catálogo, pero no se genera ni se incluye automáticamente como ficha individual porque no forma parte de las diez URLs auditadas. Su enlace abre `servicios/?servicio=desarrollo-web#detalle-servicio`.

## Compatibilidad histórica

GitHub Pages no permite configurar redirecciones HTTP 301 por ruta. `scripts/render-clean-routes.mjs` genera páginas puente para `servicios.html` y las ocho rutas históricas `servicio-*.html`. Cada puente incluye:

- `noindex,follow`;
- canonical absoluta hacia la ruta limpia equivalente;
- `meta refresh` directo al destino;
- un enlace visible que funciona sin JavaScript.

Las páginas puente quedan fuera del sitemap y los enlaces internos apuntan directamente a las rutas finales. No se debe presentar este mecanismo como una redirección HTTP 301.

El Worker de Cloudflare conserva su redirección HTTP 302 para la consulta histórica de la ficha piloto y ahora apunta a `/servicios/automatizacion-whatsapp/`. Cloudflare sigue siendo secundario: mantiene canonicals de GitHub Pages, `noindex,follow`, sitemap vacío y `X-Robots-Tag: noindex, follow`.

## Inventario indexable

- `/ForgeLock/`
- `/ForgeLock/servicios/`
- ocho fichas bajo `/ForgeLock/servicios/<slug>/`

Las tres páginas legales, los ejemplos, la 404, las páginas puente y Cloudflare no entran al sitemap oficial.
