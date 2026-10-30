# Auditoría e implementación ForgeLock — 30 de octubre de 2026

## Resultado y alcance

Cambios locales preparados para revisión en `audit/master-plan-2026-10-30`, creada desde `origin/main` actualizado (`96f2e42`). Se leyó `SPEC.md`, ya integrado por el PR #49, además del README, scripts, workflows, MVC, estilos, migraciones y pruebas. No hubo push, merge, publicación, migraciones ni cambios de configuración remota.

Se conserva JavaScript vanilla con MVC, el catálogo existente, el número de WhatsApp, las canónicas de GitHub Pages y Cloudflare como destino no indexable. `resource/Logo.png` y `resource/Logo.svg` no presentan diferencias contra la base. Se ajustaron tonos de textos verdes para corregir contraste, sin reemplazar los recursos de marca.

## Hallazgos y soluciones

| Prioridad | Defecto, impacto y evidencia | Solución / estado |
| --- | --- | --- |
| P1 | `AnalyticsService.init()` sustituía `loaded` por `ready`; también podía instalar varios listeners. Dependiendo del orden de carga, bloqueaba o duplicaba eventos. | Inicialización por documento sin sobrescribir estado de carga; regresiones de evento único. |
| P1 | Cookies sin control para revisar la elección; tres cargadores independientes. La carga tardía de GA podía conceder consentimiento después de un rechazo. | Bootstrap común para inicio, servicios y 404; preferencias accesibles, revocación con recarga, sincronización entre pestañas y comprobación de elección al completar la carga. |
| P1 | El observador de servicios podía consumir la impresión antes de aceptar; eventos bloqueados si localStorage no estaba disponible. | Observar después del consentimiento; preferencia de sesión en memoria cuando el almacenamiento está bloqueado. |
| P1 | Tailwind solo analizaba `index.html` y JS. Omitía utilidades propias de servicios, como la altura de 440 px y la composición de su hero. `brand-700`, ya usado en el código, no estaba definido. | Incluir HTML públicos, definir el tono y regenerar CSS; prueba de que el artefacto contiene las utilidades omitidas. |
| P1 | Saltos de contenido al renderizar la home y cargar fuentes. Primera medición local de esta sesión: CLS 1,006 móvil y 1,057 escritorio, antes de la optimización. Servicios presentó CLS 0,265 en escritorio. | HTML inicial generado con las mismas vistas MVC; precarga de Inter; tamaño explícito del hero y utilidades de servicios compiladas. CLS final de laboratorio: 0 en las cuatro ejecuciones. |
| P1 | Axe detectó contraste insuficiente en marca textual, brief, vista previa y consentimiento. | Tonos verdes oscuros sobre fondos claros; evaluación repetida en estados inicial y propuesta generada. |
| P2 | Volver a pintar menú y selector eliminaba el foco; Escape no cerraba el menú. | Restaurar foco, cerrar con Escape, anunciar selección con `aria-pressed` y evitar listeners repetidos del controlador. |
| P2 | La 404 resolvía enlaces y recursos contra la carpeta inexistente; Worker no declaraba uso de la página de error. | Base específica de alojamiento en el build y `not_found_handling = "404-page"`; prueba HTTP de una ruta anidada con código 404, regreso a inicio y recurso JS accesible. |
| P2 | Precios y plazos autorizados no estaban visibles; enlaces «Más información» poco descriptivos. | Planes Básica: $249.000 COP / 3 a 5 días hábiles; Profesional: $449.000 COP / 5 a 7 días hábiles. CTA contextual y enlaces con nombre de servicio. No se añade oferta Premium. |
| P2 | El CSS de Inter declaraba archivos WOFF ausentes. | Incorporar ambos archivos referenciados y copiarlos en los dos scripts de mantenimiento de assets. |
| P1 pendiente | Workers Builds ejecuta `npm run build:dist` y `npx wrangler deploy` sobre `main`, aunque Wrangler espera `dist-cloudflare/`. La URL remota del Worker respondió 404. | Confirmado mediante Cloudflare en modo lectura. Corrección remota requiere autorización independiente; no se intentó publicar. |

No se eliminaron archivos por apariencia de obsolescencia. Se conservan scripts históricos y migraciones. El cliente Supabase sigue sin conectarse al flujo comercial.

## SEO y servicios externos

La home, servicios, robots y sitemap públicos de [GitHub Pages](https://forgelock-solution.github.io/ForgeLock/) respondieron 200. Las dos páginas conservan las canónicas bajo `/ForgeLock/`; robots apunta al sitemap, que contiene dos URLs. TinyFish confirmó contenido, enlaces y metadatos públicos. Los validadores locales comprueban además JSON-LD, Open Graph, Twitter, verificación de Google, manifiesto e iconos.

Ambas distribuciones se construyeron en carpetas temporales nuevas. Pages conserva dos URLs de sitemap. Worker conserva las señales canónicas de Pages, `noindex`, sitemap vacío y robots sin Sitemap. La prueba de runtime usa Wrangler local; no es una publicación. El tratamiento de cabeceras de activos se contrastó con la [documentación de Cloudflare](https://developers.cloudflare.com/workers/static-assets/headers/).

Pendientes que impiden declarar todas las fases cerradas:

- **Search Console:** GSC Wizard rechazó el inventario por `subscription_required`. No se comprobó aceptación del sitemap, indexación ni canonical elegida por Google. Se puede verificar desde Search Console directamente; un HTTP 200 no acredita aceptación.
- **Cloudflare remoto:** home y sitemap respondieron 404. No es posible afirmar que el Worker actualmente publicado entregue el `noindex` local. El trigger permanece sin cambios.
- **Supabase:** el inventario devolvió `forge-look`, pero dos lecturas de avisos fallaron indicando hibernación. No se verificaron esquema, políticas RLS ni migraciones remotas, ni se leyeron registros de clientes o claves. No se activó almacenamiento de contactos.
- **GA4/GTM:** se verificó un `whatsapp_click` y una configuración local por página, interceptando scripts externos para no enviar tráfico de prueba. El script público de GTM respondió 200 y no contenía literalmente el Measurement ID; esto no prueba la configuración completa ni entrega real de eventos. Revisar el contenedor con Tag Assistant y GA4 DebugView antes de publicar. Evitar que GTM configure nuevamente GA4 o reproduzca esos eventos.
- **Negocio:** falta un criterio aprobado de lead cualificado y el diseño de tratamiento/permisos antes de habilitar Supabase. Premium sigue sin precio ni alcance añadidos.

## Pruebas y evidencias

Node 24.20.0 y npm 11.19.0. `npm ci` terminó correctamente; `npm audit` reportó cero vulnerabilidades conocidas. No se cambiaron dependencias ni lockfile. npm avisó de scripts de instalación de esbuild/workerd; el preview real de Wrangler funcionó. Browserslist avisó de datos antiguos de caniuse-lite; se registra como mantenimiento pendiente, sin actualizar dependencias dentro de esta tanda.

| Comprobación ejecutada | Resultado |
| --- | --- |
| `npm test` antes de cambios | 43 aprobadas, 0 fallidas, 0 omitidas. |
| `npm test` después de cambios | 48 aprobadas, 0 fallidas, 0 omitidas; incluye builds, preservación de fuentes/salidas y preview HTTP real de Wrangler. |
| `npm run build:styles` | Correcto; CSS fuente actualizado. |
| `npm run build:dist` y `validate:dist` | Correctos usando `DIST_DIR` temporal; no se reemplazó un `dist/` existente. |
| `npm run build:dist:cloudflare` y `validate:dist:cloudflare` | Correctos con salida temporal separada. |
| Edge + axe, inicio/servicios a 320, 375, 768, 1024 y 1440 px | Sin infracciones detectadas WCAG A/AA seleccionadas, errores JS, respuestas HTTP de error observadas ni desbordamiento horizontal. Sin peticiones de analítica previas a consentimiento. |
| Consentimiento en Edge, ambas páginas | Rechazo persiste al recargar; aceptación carga; clic local único; revocación recarga y deja cero scripts de Google. |
| Menú y generador en Edge | Escape cierra y devuelve foco; propuesta genera enlace a WhatsApp; axe sin infracciones en ese estado. No se envió ningún mensaje. |
| Enlaces y recursos HTML locales del artefacto Pages | Sin destinos ausentes ni fragmentos rotos. |
| Escaneo de artefacto Pages | Sin `.env`, configuración privada ni coincidencias de los patrones de tokens/claves privadas examinados. No equivale a auditar todo el historial de Git. |
| `git diff --check` y comparación de logos | Sin errores de espacios; logos sin diferencias. |

### Lighthouse: resultado final local

| Página / perfil | Rendimiento | Accesibilidad | Buenas prácticas | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Inicio móvil | 98 | 100 | 100 | 100 | 1,812 s | 0 |
| Inicio escritorio | 99 | 100 | 100 | 100 | 0,893 s | 0 |
| Servicios móvil | 98 | 100 | 100 | 100 | 1,815 s | 0 |
| Servicios escritorio | 99 | 100 | 100 | 100 | 0,876 s | 0 |

Son ejecuciones de laboratorio sobre el artefacto local en Edge, con el perfil móvil predeterminado de Lighthouse y un perfil escritorio de 1440 × 900, RTT 40 ms, 10.240 Kbps y CPU ×1. No son métricas de producción, CrUX ni garantía de rendimiento futuro. Axe/Lighthouse y una revisión visual no sustituyen una auditoría manual completa con tecnologías de asistencia. Las imágenes de servicios continúan dependiendo de Unsplash.

Los resúmenes, logs y capturas están en [evidencias](evidence/auditoria-2026-10-30/README.md). Las herramientas de navegador se instalaron en una carpeta temporal fuera del repositorio; no se añadieron frameworks ni dependencias al producto.

## Archivos modificados

- HTML y contenido: `index.html`, `servicios.html`, `404.html`, `politica-cookies.html`.
- MVC y consentimiento: `src/controllers/app-controller.js`, `src/services/analytics-service.js`, nuevo `src/services/consent.js`, `src/views/app-view.js`, `src/views/idea-generator-view.js`.
- Estilos y fuentes: `tailwind.config.js`, `src/styles/app.css`, `src/styles/tailwind.css`, dos fuentes WOFF de Inter.
- Build: `scripts/create-dist.mjs`, nuevo `scripts/render-home.mjs`, `scripts/generate-seo.mjs`, ambos scripts `copy-local-assets`, `wrangler.toml`.
- Regresiones: `test/app.test.js`, `test/audit-fixes.test.js`, `test/consent.test.js`, `test/cloudflare-runtime.test.js`, `test/seo-build.test.js`, `test/services-page.test.js`.
- Contexto y revisión: `README.md`, `docs/configuracion-cloudflare-pendiente.md`, este informe, evidencias y descripción de PR preparada.

## Revisión y riesgos restantes

Fases 1–5 tienen código, pruebas y evidencias locales; no se declara cerrada la aceptación externa de SEO, analítica, base de datos ni entorno remoto. El ajuste de Cloudflare sigue siendo prioridad antes de autorizar publicación. Revisar después el contenedor GTM, GSC y Supabase; medir CWV con tráfico real y completar pruebas con lector de pantalla. No hace falta cambiar la URL canónica para estas correcciones.

Revisar el diff por bloques: consentimiento/medición; accesibilidad/conversión; build/SEO/rendimiento. Los cambios están sin publicar en la rama local. Para reversión después de una eventual integración, revertir los commits de esta tanda y reconstruir el artefacto anterior; cualquier nueva publicación mantiene su autorización separada.
