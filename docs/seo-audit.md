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
