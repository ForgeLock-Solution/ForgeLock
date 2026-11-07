# Política SEO: GitHub Pages oficial y Cloudflare secundario

Actualizada el 7 de noviembre de 2026. Esta política local no publica ni despliega cambios. La URL oficial y canónica de ForgeLock es `https://forgelock-solution.github.io/ForgeLock/`. GitHub Pages es la única versión indexable y la única que publica un sitemap con páginas. Cloudflare se conserva como entorno secundario de pruebas en `https://forgelock.forge-look19.workers.dev/`.

| Variante | Salida | Señales canónicas y sociales | Rastreo e indexación |
|---|---|---|---|
| GitHub Pages oficial | `dist/` | Diez URLs limpias con barra final; páginas puente para las rutas `.html` antiguas | Rastreo permitido; páginas finales indexables en sitemap; puentes, páginas legales, ejemplos y 404 con `noindex` |
| Cloudflare secundario | `dist-cloudflare/` | Conserva las URLs canónicas, Open Graph, Twitter y JSON-LD de GitHub Pages | Rastreo permitido para leer `noindex`; todas las páginas `noindex,follow`; sitemap vacío; sin directiva Sitemap en robots.txt; cabecera HTTP `X-Robots-Tag: noindex, follow` |

`SEO_TARGET` selecciona el alojamiento de salida. `BASE_URL`, si se proporciona, debe coincidir con ese destino. La URL canónica permanece fijada a GitHub Pages en los dos builds. Ambos artefactos generan las mismas rutas limpias; Cloudflare añade sus señales `noindex` sin sustituir las canonicals oficiales.

La portada, servicios y ocho fichas individuales son indexables en Pages y entran al sitemap si sus canonicals son propios. Desarrollo Web permanece en el catálogo sin ficha individual. Las páginas puente, las tres páginas legales, los cuatro ejemplos conceptuales y la página 404 son `noindex` y no entran al sitemap. `lastmod` solo se emite si Git aporta una fecha real válida y el archivo no tiene cambios locales. Robots permite rastrear ambos destinos; no se debe bloquear Cloudflare en `robots.txt`, ya que los motores necesitan leer su directiva `noindex`.

## Validación local

- `npm test` prueba ambos builds en directorios temporales aislados.
- `npm run build:dist` y `npm run validate:dist` validan GitHub Pages.
- `npm run build:cloudflare` y `npm run validate:dist:cloudflare` validan Cloudflare.
- Los builds no publican cambios ni confirman el estado remoto.

## Cloudflare pendiente

El archivo `_headers` y el middleware del Worker preparan `X-Robots-Tag: noindex, follow` para una proxima publicacion autorizada. El Worker remoto conserva su ultimo despliegue registrado, anterior a esta actualizacion; no se ha verificado que incluya la cabecera. Los metadatos `noindex,follow` estan en el build local. Confirmar las respuestas despues de una futura publicacion autorizada.

El modo histórico `SEO_TRANSITION` y `npm run build:dist:pages-transition` siguen deshabilitados. Una futura migración a dominio propio requiere una decisión separada, cambio de canonicals/sitemap, redirecciones, pruebas y actualización de Search Console.

## Search Console

El sitemap oficial es `https://forgelock-solution.github.io/ForgeLock/sitemap.xml`. No se debe reenviar ni solicitar indexación antes de publicar y verificar el artefacto aprobado. Después de una publicación autorizada, primero confirma por HTTP las diez rutas finales, el contenido XML, las canonicals y la ausencia de `noindex`; después revisa en Search Console la lectura del sitemap y la canonical elegida para una muestra de URLs. Una respuesta HTTP 200 y una canonical declarada no confirman aceptación, rastreo ni indexación.

El conector GSC Wizard no estuvo disponible durante la auditoría porque la cuenta conectada no tiene una suscripción activa; no se pudo consultar ni enviar el sitemap desde esa integración.
