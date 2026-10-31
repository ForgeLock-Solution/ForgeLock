# Configuración SEO pendiente para Cloudflare

Estado actualizado: 31 de octubre de 2026. GitHub Pages es el sitio oficial y canónico: `https://forgelock-solution.github.io/ForgeLock/`. Cloudflare permanece como entorno secundario de pruebas en `https://forgelock.forge-look19.workers.dev/`.

No se ha desplegado ningún cambio ni modificado Workers Builds. La configuración local prepara para el próximo despliegue autorizado:

- Canonical, Open Graph, Twitter, hreflang y JSON-LD apuntan a GitHub Pages.
- Todas las páginas HTML del Worker llevan `noindex,follow`.
- `robots.txt` permite el rastreo y omite la directiva Sitemap; `sitemap.xml` está vacío.
- `_headers` añade `X-Robots-Tag: noindex, follow` a las respuestas estáticas del hostname Worker.
- El código Worker añade la misma cabecera a respuestas atendidas por el Worker y sus redirecciones.

Cloudflare Workers Static Assets admite `_headers` para respuestas de activos estáticos; esas reglas no aplican a respuestas generadas por código Worker, por eso el middleware también las añade. Consultar la [documentación oficial de Cloudflare sobre headers de Static Assets](https://developers.cloudflare.com/workers/static-assets/headers/). No bloquear el Worker en `robots.txt`: Google debe poder rastrear la URL y detectar `noindex`.

## Revisión antes de publicar

1. Confirmar el Worker, la cuenta Cloudflare y el trigger de Workers Builds vigentes.
2. Configurar el build para ejecutar `npm test` y publicar únicamente el artefacto validado por `npm run deploy:cloudflare`, con Node 22–24.
3. Confirmar que las variables de build no hacen indexable la salida Cloudflare y que `BASE_URL`, si está configurada, coincide con el Worker.
4. Autorizar por separado el cambio remoto y cualquier publicación. Esta auditoría no otorga esa autorización.
5. Tras una publicación autorizada, comprobar HTTP, HTML `noindex`, cabecera `X-Robots-Tag`, sitemap vacío y robots rastreable.

La revisión previa del trigger en Workers Builds no se considera actual hasta volver a consultarla. Los detalles históricos y resultados de octubre de 2026 están en `docs/evidence/auditoria-2026-10-30/`; no describen el estado remoto actual.
