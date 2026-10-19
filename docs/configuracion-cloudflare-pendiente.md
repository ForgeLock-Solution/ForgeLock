# Configuración pendiente antes de activar Cloudflare Pages

Estado: preparación documental. No se han creado recursos en Cloudflare/Supabase ni realizado despliegues.

## Dominio temporal confirmado

Mientras se prepara Cloudflare, se conserva GitHub Pages como URL canónica temporal: `https://forgelock-solution.github.io/ForgeLock/`. No cambiar `BASE_URL` ni las URLs SEO hasta confirmar el dominio definitivo de Cloudflare. Al migrar, actualizar y validar conjuntamente canonical, Open Graph, Twitter Cards, JSON-LD, `robots.txt`, `sitemap.xml` y las redirecciones.

## Datos por confirmar

- [ ] Dominio propio exacto.
- [ ] Dominio canónico: raíz o www; definir una única versión y redirigir la otra.
- [ ] Confirmar que el dominio está comprado y quién administra su DNS.
- [ ] Cuenta/proyecto de Cloudflare Pages y método de conexión con GitHub.
- [ ] Rama de producción; propuesta: main, pendiente de confirmación.
- [ ] Comando de build: npm run build:dist.
- [ ] Directorio de salida: dist.
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
- Rama de trabajo: chore/cloudflare-static-config
- Comando de build: npm run build:dist
- Salida esperada: dist/
- Marca pública: ForgeLock
- Idioma: es-CO
- Colores de esta propuesta: oscuro #0b1120 y blanco #ffffff; confirmar contra la identidad visual vigente.

## Validaciones antes de producción

1. Ejecutar `npm ci`, `npm test` y `npm run build:dist`. La compilación incluye `scripts/validate-dist.mjs` para revisar los archivos esenciales, la URL del sitemap y las dimensiones declaradas/reales de los iconos.
2. Confirmar que `dist/` contiene `site.webmanifest`, `_headers`, `_redirects`, `favicon.ico`, `Icon-192.png`, `Apple-touch-icon.png`, HTML, CSS, JS, imágenes, `robots.txt` y `sitemap.xml`.
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
