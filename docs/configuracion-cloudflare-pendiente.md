# Configuración pendiente para publicar Cloudflare Worker Static Assets

Estado: preparación pendiente. La política vigente es [GitHub Pages como producción y Cloudflare como pruebas no indexables](seo-cloudflare-transition.md). No realizar despliegues desde este documento.

Revisión de solo lectura del 30 de octubre de 2026: el trigger de `forgelock` sigue usando `npm run build:dist` y `npx wrangler deploy` sobre `main`. La URL pública del Worker y su sitemap respondieron 404; eso no permite validar la política SEO del despliegue remoto. Los builds locales y el preview de Workers Static Assets sí se verificaron. Consulta las evidencias y limitaciones en [la auditoría maestra](auditoria-maestra-2026-10-30.md). No se modificó el trigger ni se publicó un artefacto.

## Dominio temporal confirmado

Mientras se prepara Cloudflare, se conserva GitHub Pages como URL canónica de producción: `https://forgelock-solution.github.io/ForgeLock/`. `BASE_URL` identifica cada alojamiento; las URLs SEO de producción se conservan en ambas variantes. El Worker se genera con noindex y sin URLs de sitemap. La migración canónica está deshabilitada; requiere autorización y revisión separadas.

## Datos por confirmar

### Paso 2: propuesta remota preparada, todavía sin aplicar

El trigger de Workers Builds se consultó nuevamente: continúa ejecutando `npm run build:dist` seguido de `npx wrangler deploy`, sobre `main`. El build genera `dist/`, pero Wrangler espera `dist-cloudflare/`. GitHub Pages conserva su workflow independiente y su producción actual.

Propuesta para usar el flujo protegido existente sin duplicar la construcción de publicación:

| Ajuste | Valor propuesto |
|---|---|
| Worker | `forgelock` |
| Cuenta detectada, pendiente de confirmación del responsable | `fc854c3291faa99f884d4568138cff95` |
| Build command de Workers Builds | `npm test` |
| Deploy command | `npm run deploy:cloudflare` |
| Autorización de publicación automática, solo si se aprueba expresamente | `FORGELOCK_DEPLOY_CONFIRMATION=deploy-forgelock` |
| Node para Workers Builds | 22–24 |

`npm test` construye y prueba en salidas temporales. El comando de despliegue construye después el único artefacto destinado a publicación y lo valida mediante el build compartido. No se reutiliza el `dist/` antiguo ni se ejecuta una segunda validación redundante. El script mantiene su modo preflight sin publicación cuando falta la confirmación de despliegue.

Antes de aplicar esta propuesta, confirmar la cuenta y el Worker; autorizar por separado el cambio del trigger y la publicación automática desde `main`. Revisar las variables de build sin exponer secretos: `INDEXABLE` debe estar ausente o ser `false` para Cloudflare; `BASE_URL`, si existe, debe corresponder al Worker; `SEO_TRANSITION` debe estar ausente. El `account_id` sigue sin añadirse al archivo local. No se modificó el trigger remoto ni se publicó nada.

Las pruebas nuevas simulan la invocación de publicación; comprueban la configuración conservada, el mismo artefacto y el rechazo de fallos sin llamar a Cloudflare.

- [ ] Dominio propio exacto.
- [ ] Dominio canónico: raíz o www; definir una única versión y redirigir la otra.
- [ ] Confirmar que el dominio está comprado y quién administra su DNS.
- [ ] Confirmar el Worker `forgelock` y el método autorizado de publicación.
- [ ] Confirmar con el responsable de la cuenta el `account_id` que debe fijarse en `wrangler.toml`; el preflight falla mientras no esté confirmado.
- [ ] Rama de producción; propuesta: main, pendiente de confirmación.
- [ ] Build de Worker: `npm run build:dist:cloudflare`.
- [ ] Directorio de activos del Worker: `dist-cloudflare/`.
- [ ] Node 22–24 para Wrangler, compatible con las dependencias fijadas.
- [ ] Conservar GitHub Pages durante la validación; cualquier cambio de producción necesita autorización separada.
- [ ] URL de proyecto Supabase (solo URL pública, nunca claves secretas).
- [ ] Proveedores de Auth habilitados en Supabase.
- [ ] URL de sitio y URLs de redirección permitidas para Auth, una vez conocido el dominio.
- [ ] URL final para canonical, Open Graph, Twitter Cards, JSON-LD, sitemap y robots.
- [ ] Confirmar Measurement ID GA4 y revisar si GTM también carga GA4 para evitar duplicación.
- [ ] Confirmar si el panel será de administración individual o tendrá varios roles.
- [ ] Definir política de Storage: recursos públicos del sitio separados de documentos privados.
- [ ] Definir contacto técnico y procedimiento de rollback.

## Valores conocidos

- Repositorio: ForgeLock-Solution/ForgeLock
- Rama de trabajo de la fase 1: `fix/wrangler-preview-config`
- Build Pages: `npm run build:dist`; salida `dist/`.
- Build Worker: `npm run build:dist:cloudflare`; salida `dist-cloudflare/`.
- Publicación futura únicamente mediante `npm run deploy:cloudflare` tras autorización.
- Marca pública: ForgeLock
- Idioma: es-CO
- Colores de esta propuesta: oscuro #0b1120 y blanco #ffffff; confirmar contra la identidad visual vigente.

## Validaciones antes de producción

1. Ejecutar `npm ci` y `npm test`. Antes de generar distribuciones, inspeccionar `dist/` y `dist-cloudflare/`; los builds se detienen si su salida ya contiene archivos. Para validar sin reemplazar artefactos, usar `DIST_DIR` con una carpeta temporal vacía.
2. Confirmar que `dist-cloudflare/` contiene `site.webmanifest`, `_headers`, `_redirects`, iconos, HTML, CSS, JS, imágenes, `robots.txt` y `sitemap.xml`.
3. Revisar los iconos en navegador y comprobar visualmente transparencia, recorte y nitidez; el validador comprueba formato PNG y dimensiones de los dos iconos declarados en el manifiesto.
4. Verificar que no haya claves privadas ni archivos .env dentro del artefacto.
5. Validar rutas del manifiesto e iconos en el preview de Cloudflare.
6. Probar cabeceras HTTP; revisar consentimiento de analítica y que no se bloquee ningún recurso.
7. No aplicar CSP restrictiva ni HSTS con includeSubDomains hasta probar el dominio y todos los subdominios usados.
8. Validar que el Worker conserve las señales SEO de Pages y entregue todas las páginas con noindex, sitemap vacío y robots sin Sitemap.
9. Configurar URLs de redirección de Supabase Auth y probar login, logout y recuperación.
10. Aprobar explícitamente el cambio de producción antes de fusionar o desplegar.

## Notas de seguridad

- No guardar claves, tokens, contraseñas ni SUPABASE_SERVICE_ROLE_KEY aquí.
- La clave service_role solo puede existir en entornos seguros de servidor/CI; nunca en HTML, JS del navegador ni dist/.
- Los headers de esta propuesta son una base conservadora, no una auditoría de seguridad completa.
- _redirects no tiene reglas activas porque falta el dominio canónico.
