# Título propuesto

fix: estabilizar consentimiento, estilos de servicios y render inicial de ForgeLock

## Descripción preparada

La inicialización de analítica podía sobrescribir su estado de carga y duplicar listeners; el visitante tampoco podía revisar su elección de cookies. Inicio, servicios y 404 comparten ahora el cargador, con revocación, control de respuestas tardías y medición local única.

El build incluye las clases de servicios que Tailwind omitía y entrega la home con las vistas MVC ya renderizadas. La precarga de fuentes y el tamaño del hero reducen saltos de contenido. Se corrigen contraste, foco del menú y selectores, rutas de 404 y nombres de enlaces; se añaden los dos planes con precios y plazos autorizados.

Se mantienen los recursos de logo, catálogo, JavaScript vanilla, canónicas de GitHub Pages y la variante Cloudflare con noindex. No se activa Supabase ni se modifican servicios remotos.

Validación: 48 pruebas Node aprobadas, incluidos builds SEO y preview HTTP local de Wrangler; Edge/axe en cinco anchos para las dos páginas; flujos de consentimiento y generador; Lighthouse local con rendimiento 98 móvil / 99 escritorio, CLS 0 y accesibilidad/SEO 100. Detalles y límites en [la auditoría](auditoria-maestra-2026-10-30.md).

Antes de cualquier publicación, resolver por separado el trigger remoto de Cloudflare y revisar GTM/GA4, aceptación del sitemap en GSC y estado de Supabase. Este documento prepara la revisión; no se abrió PR remoto, no se hizo push, merge ni deploy.
