# Fichas de servicios

Las fichas públicas se generan desde `SERVICE_CATALOG` mediante `src/views/service-fiche-view.js` y `scripts/render-service-fiches.mjs`. La ficha piloto es `servicio-automatizacion-whatsapp.html`; su cuerpo y meta descripción usan el texto corto autorizado del catálogo. Una descripción larga no se publica hasta recibir aprobación.

GitHub Pages publica HTML estático y no ejecuta reglas HTTP de redirección por query string. La página `servicios.html?servicio=…` continúa seleccionando el servicio mediante el controlador MVC; Pages no puede emitir una respuesta HTTP 301/302 distinta según el valor de `servicio` sin un servicio/proxy externo. El cliente mantiene el listado funcional.

El Worker de Cloudflare puede procesar la ruta antes de entregar assets. Para la ficha piloto, `src/platform/cloudflare-worker.js` emite una redirección HTTP 302 desde `/servicios?servicio=automatizacion-whatsapp` y `/servicios.html?servicio=automatizacion-whatsapp`. `_redirects` no admite condiciones por parámetros de query, por eso este caso se implementa en el Worker, con `run_worker_first` limitado a las dos rutas.

SEO por destino:

- Pages genera canonical propia para cada ficha pública y la añade al sitemap.
- Cloudflare conserva su canonical de destino, añade `noindex,follow` a todas las páginas y genera un sitemap vacío.
- La redirección del Worker solo corresponde al servicio que tenga ficha estática; los demás valores de `servicio` se sirven desde `servicios` mientras no se creen sus fichas.

El título propuesto para la segunda sección del catálogo es **“Presencia digital”**. Está pendiente de aprobación.
