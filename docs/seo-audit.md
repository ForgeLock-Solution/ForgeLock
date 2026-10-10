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
| Build incluye robots y sitemap | PENDIENTE | `package.json`, `scripts/create-dist.mjs` | `build:dist` debe ejecutar el generador después de crear `dist/`. |
| Title y description únicos, canonical propio y un h1 estático | PENDIENTE | Todas las páginas HTML | Validar cada página y el contenido estático; no inferir el h1 renderizado por JavaScript como HTML estático. |
| Favicon ICO raíz, PNG 48/192 y apple-touch-icon | FALLA | `resource/`, `index.html`, `servicios.html` | `resource/favicon.ico`, `resource/favicon-192.png` y `resource/apple-touch-icon.png` no se encontraron; añadir los archivos y enlazarlos. `favicon-48.png` existe en resource, no en la raíz. |
| JSON-LD Organization/WebSite/WebPage: name, alternateName, url y logo cuadrado >=112 px | PENDIENTE | `index.html`, `servicios.html` | Comprobar dimensiones reales de Logo.png y validar JSON-LD; no agregar `sameAs` sin redes confirmadas. |
| Imágenes referenciadas existentes y alt | PENDIENTE | HTML y carpetas de recursos | Verificar todas las referencias, alt y respuesta HTTP; no se puede confirmar respuesta 200 únicamente desde el código fuente. |
| Pruebas `npm test` y build `npm run build:dist` | PENDIENTE | `package.json` | Ejecutar en un checkout con dependencias instaladas y comprobar `dist/`. |

## Decisiones y límites
- Se conserva `https://forgelock-solution.github.io/ForgeLock/` como URL base oficial.
- No se agregan redes sociales a `sameAs` sin confirmación.
- No se han cambiado secretos ni claves de Supabase.
- Los estados que requieren ejecutar el build o inspeccionar dimensiones se mantienen pendientes hasta obtener evidencia.
