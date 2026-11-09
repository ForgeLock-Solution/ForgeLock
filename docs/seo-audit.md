# Auditoría SEO técnica de ForgeLock

Fecha de auditoría: 2026-10-10  
BASE_URL: `https://forgelock-solution.github.io/ForgeLock/`

| Ítem | Estado | Archivo y línea | Arreglo propuesto |
|---|---|---|---|
| Nombre de marca en title, Open Graph, Twitter y JSON-LD | OK parcial | `index.html`, `servicios.html` (head) | Se unificó la variante de marca en los metadatos y entidades JSON-LD a `ForgeLock`; revisar las páginas restantes en cada iteración. |
| Author | OK | `index.html`, `servicios.html` | Mantener `ForgeLock`. |
| Canonical, og:url y URL de JSON-LD | OK parcial | `index.html`, `servicios.html` | Se conserva la subruta oficial de GitHub Pages. Verificar todas las páginas legales y los recursos durante la validación local. |
| `robots.txt` apunta al sitemap | OK tras generación | `robots.txt` | Generar desde `BASE_URL` con `scripts/generate-seo.mjs`. |
| Sitemap con URL indexables y lastmod real | OK tras generación, pendiente ejecutar build | `sitemap.xml`, `scripts/generate-seo.mjs` | Incluir únicamente home y servicios si existen y son indexables; derivar `lastmod` de `git log`, omitiéndolo si no hay dato real. |
| Build incluye robots, sitemap y favicon ICO | OK en configuración; pendiente ejecutar | `package.json`, `scripts/create-dist.mjs` | `build:dist` llama al generador SEO; `create-dist.mjs` copia el ICO raíz a `dist/`. Validar mediante CI o ejecución local. |
| Title y description únicos, canonical propio y un h1 estático | PENDIENTE | Todas las páginas HTML | Validar cada página y el contenido estático; no inferir el h1 renderizado por JavaScript como HTML estático. |
| Favicon ICO raíz | OK en código; falta prueba de artefacto publicado | `favicon.ico`, `index.html`, `servicios.html`, páginas legales, `404.html`, `scripts/create-dist.mjs` | Se verificó que el archivo ICO existe en la raíz de `main`; se añadió su enlace a las páginas y la copia a `dist/`. No se confirmaron PNG 192 × 192 ni apple-touch-icon en raíz; el usuario confirma que los recursos están disponibles, pero falta comprobar nombres/rutas exactos en el árbol publicado. |
| JSON-LD Organization/WebSite/WebPage: name, alternateName, url y logo cuadrado >=112 px | OK parcial | `index.html`, `servicios.html` | El usuario confirma que el logo mide 800 × 800 px. La marca se unificó a `ForgeLock`; falta validar localmente todos los bloques JSON-LD y confirmar que el archivo de logo servido es el mismo recurso. No agregar `sameAs` sin redes confirmadas. |
| Imágenes referenciadas existentes y alt | PENDIENTE | HTML y carpetas de recursos | Verificar todas las referencias, alt y respuesta HTTP; no se puede confirmar respuesta 200 únicamente desde el código fuente. |
| Pruebas `npm test` y build `npm run build:dist` | PENDIENTE | `package.json` | Ejecutar en un checkout con dependencias instaladas y comprobar `dist/`. |

## Decisiones y límites
- Se conserva `https://forgelock-solution.github.io/ForgeLock/` como URL base oficial.
- No se agregan redes sociales a `sameAs` sin confirmación.
- No se han cambiado secretos ni claves de Supabase.
- Los estados que requieren ejecutar el build o inspeccionar dimensiones se mantienen pendientes hasta obtener evidencia.


## Verificación adicional (10 de octubre de 2026)

- Confirmados títulos, descripciones, canonical y un H1 en `index.html`, `servicios.html` y las tres páginas legales.
- Las tres páginas legales mantienen `noindex,follow` intencionalmente. No se deben incluir en el sitemap ni solicitar su indexación hasta que el contenido legal y la validación de consentimiento estén aprobados.
- La página 404 mantiene `noindex,follow` y no necesita canonical.
- Se añadieron enlaces `./favicon.ico` a las páginas y se actualizó el build para copiar el ICO a `dist/`.
- El workflow usa checkout con historial completo para que el `lastmod` calculado por Git no dependa de un clon superficial.
- Las pruebas `npm test` y `npm run build:dist` aún no se han ejecutado desde esta sesión; no se afirma que pasen.

## Verificación y política vigente (31 de octubre de 2026)

GitHub Pages sigue siendo el sitio oficial: `https://forgelock-solution.github.io/ForgeLock/`. La portada, `servicios.html` y las nueve fichas individuales consultadas respondieron HTTP 200. Cada una declara su propia canonical de GitHub Pages y no tiene `noindex`. El sitemap publicado contiene exactamente esas once páginas, y `robots.txt` permite el rastreo y apunta al sitemap de Pages. Las fechas `lastmod` observadas en el sitemap publicado son 2026-10-30 para la portada y 2026-10-31 para la ficha de WhatsApp y servicios; el resto no declara esa etiqueta.

La política local está alineada para mantener canonical y metadatos de GitHub Pages en ambos builds. Cloudflare se conserva como entorno secundario rastreable pero `noindex`, con sitemap vacío y cabecera `X-Robots-Tag: noindex, follow` preparada. No se publicó ni desplegó ningún cambio. La integración de Search Console de GSC Wizard devolvió `payment_required` porque su suscripción no está activa; el envío del sitemap y la inspección de URLs quedan para el procedimiento manual descrito en `docs/seo-cloudflare-transition.md`.

## Auditoría de Search Console y rutas públicas (9 de noviembre de 2026)

Esta comprobación GET es una observación pública puntual; no consulta el estado interno de Search Console ni prueba el rastreo desde infraestructura de Google.

| Recurso/componente | Estado observado | Resultado |
|---|---|---|
| `https://forgelock-solution.github.io/robots.txt` | HTTP 404 | El proyecto `/ForgeLock/` no controla el robots en la raíz del origen. |
| `https://forgelock-solution.github.io/ForgeLock/robots.txt` | HTTP 200, `text/plain` | El archivo del proyecto permite `/` y anuncia el sitemap oficial. No reemplaza el robots global. |
| `https://forgelock-solution.github.io/ForgeLock/sitemap.xml` | HTTP 200, `application/xml` | XML UTF-8 parseable, namespace oficial, 10 URLs absolutas únicas bajo `/ForgeLock/`, sin localhost ni `lastmod` inválidos. |
| Diez URLs indexables | HTTP 200 cada una | Canonical absoluta propia y `index,follow`; no se observó `noindex`. |
| Nueve puentes `.html` heredados | HTTP 200 cada uno | `noindex,follow`, canonical a la ruta limpia y actualización inmediata; no redirigen en el servidor. |
| Build de GitHub Pages | `./dist` | `deploy-pages.yml` sube `dist/`; la generación SEO y el validador se ejecutan antes de subir el artefacto. |

El éxito HTTP y XML del sitemap indica que el recurso es recuperable desde esta comprobación, pero no identifica por sí solo la causa del mensaje de Search Console. Un `robots.txt` global ausente no equivale a una regla `Disallow` y no bloquea automáticamente el sitio. Hace falta revisar el detalle de error de Search Console y repetir la comprobación tras cualquier publicación autorizada.

### Inventario de rutas reales

Las URLs indexables actuales son Inicio (`/ForgeLock/`), Servicios (`/ForgeLock/servicios/`) y ocho fichas: Automatización de WhatsApp, Sistemas Empresariales, Automatización de Procesos, Integraciones, Soluciones Personalizadas, Landing pages, Catálogos digitales y Branding y diseño digital. No se añadieron rutas nuevas.

De la lista de categorías solicitada, Landing pages, Catálogos digitales, Integraciones y Branding tienen ficha propia. Páginas corporativas aparece como oferta de Desarrollo Web, pero no tiene ficha indexable independiente. Contacto es una sección de Inicio (`#contacto`), no una página aparte. E-commerce, Mantenimiento y Seguridad, y SEO y Analítica no tienen páginas públicas independientes identificadas en el catálogo actual.

GitHub Pages sirve las rutas limpias desde directorios con `index.html`. Los archivos `servicios.html` y `servicio-*.html` conservan compatibilidad como puentes `noindex,follow`; canonicalizan a la ruta limpia. No se recomienda una migración masiva adicional mientras la comprobación pública de estas rutas sea correcta.

### Alcance del robots global

El archivo de este repositorio se publica en `/ForgeLock/robots.txt`. Solo el sitio Pages que controla la raíz de `forgelock-solution.github.io` puede publicar `/robots.txt`; no es posible corregir esa ubicación desde este repositorio de proyecto. Si se desea un robots explícito en el origen, el responsable del sitio Pages de usuario/organización debe aprobar y publicar allí un archivo equivalente a:

```text
User-agent: *
Allow: /ForgeLock/

Sitemap: https://forgelock-solution.github.io/ForgeLock/sitemap.xml
```

La ubicación suele pertenecer al repositorio de Pages de usuario/organización (por ejemplo, `ForgeLock-Solution.github.io` si está configurado). Esta corrección externa no se realizó ni forma parte del build de `/ForgeLock/`.

### Revalidación local y pública

Después de generar `dist/`, `npm run audit:seo:public` compara el artefacto local con las respuestas públicas, comprueba status/content-type, XML, las rutas indexables, canonicals, `noindex` y los puentes. Evalúa además las reglas robots públicas contra las rutas de todos los archivos del artefacto, incluidos CSS, JavaScript e imágenes. Advierte si falta el robots global. La comprobación de User-Agent Googlebot solo simula esa cabecera y no demuestra acceso desde IPs de Google ni rastreo real. Este comando es optativo, usa red y no forma parte del build o CI.

El build valida el sitemap estático contra canonicals, URLs indexables, el prefijo oficial y reglas del `robots.txt` generado. También verifica que las reglas robots no bloqueen ningún archivo del artefacto publicado. La validación no puede certificar el archivo global del origen.

### Resultados de validación de esta rama

| Comando | Resultado |
|---|---|
| `node --test test/public-seo.test.js` | 4 pruebas aprobadas, incluida la detección de recursos bloqueados por el robots global. |
| `npm test` | TypeScript sin errores; 35 pruebas aprobadas. |
| `npm run build:dist` | Aprobado; 22 documentos HTML, 10 URLs indexables y sitemap validado. Los archivos SEO quedan presentes en `dist/` y en la raíz fuente. |
| `npm run build:cloudflare` | Aprobado; 22 documentos HTML y sitemap vacío/noindex como se espera para ese destino. Solo validación local; no se publicó. |
| `npm run audit:seo:public` | 10 páginas indexables y 9 puentes con HTTP 200; sitemap público coincide con `dist/`. El robots global devolvió 404 y se reportó como advertencia. |
| `git diff --check` | Sin errores de whitespace. |

Las pruebas con respuestas simuladas son locales; el auditor HTTP consulta producción. La comprobación pública sí confirma las respuestas HTTP y canonicals de las páginas incluidas en el sitemap y de los puentes, pero no verifica por separado el status HTTP de cada imagen, CSS o JavaScript. No se ha hecho push, merge ni despliegue durante esta auditoría.

### Search Console después de la aprobación y publicación

1. Confirma que la propiedad verificada de Search Console incluye `https://forgelock-solution.github.io/ForgeLock/`.
2. Verifica por HTTP el sitemap exacto `https://forgelock-solution.github.io/ForgeLock/sitemap.xml` y el robots del origen, si se publica por separado.
3. En **Indexación → Sitemaps**, envía esa URL exacta o actualiza el envío existente y revisa el resultado detallado, no solo el estado general.
4. Inspecciona la URL de Inicio y una ficha representativa; compara la canonical declarada con la canonical elegida por Google y revisa si la inspección en vivo puede recuperarlas.
5. Si persiste “No se ha podido leer el sitemap”, conserva el mensaje detallado y la hora del último intento para diagnosticarlo; el estado no se puede resolver ni garantizar desde las pruebas locales.

No se garantiza la aceptación del sitemap ni la indexación efectiva: ambas dependen de la comprobación posterior de Google.
