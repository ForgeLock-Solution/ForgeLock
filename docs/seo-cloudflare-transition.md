# Transición SEO coordinada: GitHub Pages y Cloudflare Worker

## Variantes preparadas

| Variante | Salida | Host de recursos y navegación | Canonical y sitemap |
|---|---|---|---|
| GitHub Pages actual | `dist/` | `https://forgelock-solution.github.io/ForgeLock/` | GitHub Pages |
| Cloudflare Worker | `dist-cloudflare/` | `https://forgelock.forge-look19.workers.dev/` | Cloudflare Worker |
| Pages de transición | Temporal, creada por `npm run build:dist:pages-transition` | Conserva los recursos y enlaces relativos de Pages, incluida `/ForgeLock/` | Canonicals, `og:url` y URLs de identidad JSON-LD de Cloudflare; sitemap propio vacío y `robots.txt` apunta al sitemap del Worker |

Las páginas legales conservan `noindex` y no se incluyen en el sitemap indexable. La variante de transición no modifica el workflow de Pages ni el build predeterminado. El generador deja el artefacto temporal disponible para su revisión; no se debe copiar a una salida de publicación sin volver a validar exactamente el artefacto que se publicará.

El build y el preflight de publicación no reemplazan una distribución que ya contenga archivos. El preflight futuro construirá y validará en una carpeta temporal y, solo con autorización, entregará a Wrangler esa misma carpeta validada. Si la identidad de cuenta no está confirmada, `wrangler.toml` no debe inventar un `account_id` y el preflight debe fallar.

## Secuencia previa a la migración pública

1. **Validar la variante Worker.** Construirla en una salida aislada, ejecutar el validador y el preview local de Wrangler. Confirmar las rutas finales, redirecciones de `.html`, canonical, `og:url`, JSON-LD, sitemap, robots, páginas legales y recursos. No asumir que el preview local reproduce cada detalle del Worker remoto.
2. **Generar y revisar Pages de transición.** Ejecutar `npm run build:dist:pages-transition`; comprobar que las imágenes, hojas de estilo, módulos, enlaces relativos y navegación siguen usando las rutas físicas de Pages, mientras las señales de indexación previstas apuntan al Worker.
3. **Comparar ambos artefactos.** Revisar por separado canonical, Open Graph, Twitter, JSON-LD, sitemap y robots. El sitemap Worker debe contener solo páginas públicas indexables con rutas finales accesibles. El sitemap de la variante Pages de transición debe permanecer vacío y su `robots.txt` debe referenciar el sitemap Worker, no recomendar URLs Pages.
4. **Obtener autorización coordinada.** Confirmar el `account_id`, el Worker exacto y el artefacto que se publicará con el responsable de Cloudflare. Obtener aprobación para la publicación coordinada de Cloudflare y GitHub Pages. No inferir identidad de cuenta por el nombre del Worker ni por una sesión CLI local.
5. **Publicar en orden y revisar cada paso.** Primero publicar el artefacto Worker validado; inmediatamente después publicar Pages con la variante de transición aprobada. Tras cada publicación, comprobar los dos hosts y detener el siguiente paso ante cualquier discrepancia. Durante el intervalo entre ambos pasos puede existir contenido duplicado con señales canónicas distintas; mantener el intervalo corto y coordinado.
6. **Verificar ambos hosts públicamente.** Comprobar respuestas HTTP iniciales y finales, `Location`, rutas canónicas, redirecciones, canonicals, `og:url`, JSON-LD, robots, sitemap, `noindex` legal, enlaces y recursos. No declarar una redirección permanente desde Pages: esta arquitectura no la implementa ni la valida.
7. **Verificar Search Console cuando la transición pública sea coherente.** Usar la propiedad que corresponda a cada host y acceso confirmado; para `workers.dev`, verificar la propiedad URL-prefix aplicable. Solo después de comprobar ambos hosts, enviar el sitemap Worker. No solicitar indexación durante esta preparación.
8. **Vigilar la canonicalización.** Revisar cobertura, páginas indexadas y canonical elegida por Google durante las semanas siguientes. Las canonicals y sitemaps son señales, no una garantía de que Google adopte inmediatamente la URL preferida.

## Coexistencia y riesgos

Antes del corte, ambos hosts sirven contenido equivalente y cada variante mantiene señales propias. Mientras Pages y Worker coexistan, los motores pueden detectar contenido duplicado. La transición reduce esa ambigüedad mediante canonical cruzado de Pages y sitemap Worker, pero no sustituye una migración coordinada ni garantiza la selección del canonical. No configurar redirecciones permanentes por inferencia: GitHub Pages no aplica automáticamente las reglas `_redirects` del Worker. Si se decide usar un dominio propio, definir y validar primero el host final y regenerar ambas variantes antes de cambiar señales públicas.

Esta guía no autoriza ni ejecuta despliegues, cambios DNS, modificaciones de Supabase o acciones en Search Console.
