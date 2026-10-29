# Configuración pendiente para publicar Cloudflare Worker Static Assets

Estado: guía de transición. No realizar despliegues desde este documento; sigue vigente el preflight seguro descrito en README.

## Dominio temporal confirmado

Mientras se prepara Cloudflare, se conserva GitHub Pages como URL canónica temporal: `https://forgelock-solution.github.io/ForgeLock/`. No cambiar `BASE_URL` ni las URLs SEO hasta confirmar el dominio definitivo de Cloudflare. Al migrar, actualizar y validar conjuntamente canonical, Open Graph, Twitter Cards, JSON-LD, `robots.txt`, `sitemap.xml` y las redirecciones.

## Datos por confirmar

- [ ] Dominio propio exacto.
- [ ] Dominio canónico: raíz o www; definir una única versión y redirigir la otra.
- [ ] Confirmar que el dominio está comprado y quién administra su DNS.
- [ ] Confirmar el Worker `forgelock` y el método autorizado de publicación.
- [ ] Confirmar con el responsable de la cuenta el `account_id` que debe fijarse en `wrangler.toml`; el preflight falla mientras no esté confirmado.
- [ ] Rama de producción; propuesta: main, pendiente de confirmación.
- [ ] Build de Worker: `npm run build:dist:cloudflare`.
- [ ] Directorio de activos del Worker: `dist-cloudflare/`.
- [ ] Versión de Node compatible con package.json (Node 20–24).
- [ ] Confirmar si se mantiene GitHub Pages durante la validación o se desactiva tras aprobar Cloudflare.
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
- Rama de trabajo de esta preparación: `codex/cloudflare-seo-migration-20261029`
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
8. Validar canonical, metadatos sociales, JSON-LD, sitemap y robots en el dominio definitivo.
9. Configurar URLs de redirección de Supabase Auth y probar login, logout y recuperación.
10. Aprobar explícitamente el cambio de producción antes de fusionar o desplegar.

## Notas de seguridad

- No guardar claves, tokens, contraseñas ni SUPABASE_SERVICE_ROLE_KEY aquí.
- La clave service_role solo puede existir en entornos seguros de servidor/CI; nunca en HTML, JS del navegador ni dist/.
- Los headers de esta propuesta son una base conservadora, no una auditoría de seguridad completa.
- _redirects no tiene reglas activas porque falta el dominio canónico.
