# ForgeLock — Especificación maestra y hoja de ruta
**Actualizado:** 2026-10-30 · **Estado:** documento de trabajo, no autorización de despliegue.

## 1. Propósito
ForgeLock ayuda a emprendedores, profesionales y pequeños negocios colombianos a presentar su negocio y facilitar el contacto y la consulta de servicios mediante páginas web, landing pages, catálogos, branding y diseño digital.
**Frase de marca:** «ForgeLock transforma ideas y negocios en experiencias digitales que destacan».
**KPI comercial principal:** conversaciones y solicitudes de cotización cualificadas desde WhatsApp; seguidores no son un KPI final.
**Nombre público:** ForgeLock (no ForgeLook ni ForgeLock Solution).

## 2. Sitio y secciones
- `index.html`: presentación de marca, propuesta de valor, soluciones, proceso, preguntas frecuentes y CTA a WhatsApp.
- `servicios.html`: descripción/comparación de servicios y CTA; verificar en cada actualización los textos comerciales y precios antes de publicar.
- `politica-privacidad.html`, `politica-cookies.html`, `aviso-legal.html`: páginas legales.
- `404.html`: página de error.
**Oferta comercial de referencia aportada por el responsable (validar sincronización con el sitio):**
- Landing Básica: 249.000 COP; 3–5 días hábiles. Una página responsive, presentación, servicios/productos, WhatsApp, redes, formulario, integración con dominio del cliente, publicación y una ronda de cambios.
- Landing Profesional: 449.000 COP; 5–7 días hábiles. Hasta seis secciones, galería, testimonios, FAQ, contactos, responsive, dominio del cliente, SEO básico, Search Console, Analytics y dos rondas de cambios.
- Premium/Empresarial: precio y alcance **no confirmados**. Nunca inventarlos.

## 3. Identidad visual
- Mantener el logotipo original en `resource/Logo.png` y `resource/Logo.svg`, sin rediseñarlo. El encabezado del sitio usa el isotipo aprobado `resource/isotipo.png`; no sustituirlo por el logotipo de los datos estructurados ni por el favicon.
- Fondo oscuro identificado en metadatos: `#0b1120`.
- Verde de marca en Tailwind: `#4ade80` (400), `#22c55e` (500), `#16a34a` (600).
- Familia tipográfica declarada: Inter, fallback sans-serif; incluye fuentes vendorizadas.
- Contrastar cualquier ajuste con los estilos reales de `src/styles/`; los colores aquí son referencias verificadas, no un inventario exhaustivo.

## 4. Stack y estructura
- HTML estático + CSS + Tailwind CSS 3 + JavaScript vanilla con MVC frontend.
- Node.js y npm para build y test; Node >=20 <25; operaciones Wrangler con Node >=22 <25.
- `index.html`, `servicios.html`: páginas públicas.
- `src/controllers/`, `src/models/`, `src/views/`: lógica MVC.
- `src/services/`: servicios de IA, analítica y cliente Supabase.
- `src/styles/`: estilos; `src/vendor/`: dependencias y fuentes locales.
- `resource/`: logos, iconos e imagen social.
- `scripts/`: construcción, SEO, validadores y despliegues protegidos.
- `test/`: pruebas Node de funcionalidad, SEO, consentimiento, accesibilidad y Cloudflare.
- `docs/`: auditorías y políticas históricas.
- `supabase/migrations/`: esquema y políticas de leads; su presencia NO prueba aplicación remota.

## 5. Estado verificado y límites
- URL oficial temporal: `https://forgelock.forge-look19.workers.dev/` hasta conseguir la primera venta; esta decisión no publica ni actualiza remotamente el Worker. GitHub Pages no se toca.
- Sitemap accesible con dos URLs: home y servicios. La respuesta pública no confirma la aceptación del sitemap por Search Console.
- Canonical, OG, Twitter Card y favicon están presentes en home; revisar cada página y funcionamiento real por separado.
- GitHub Pages: `npm run build:dist` -> `dist/`; su destino y flujo remoto permanecen independientes.
- Cloudflare Worker: `npm run build:dist:cloudflare` -> `dist-cloudflare/`, canonical y señales sociales/JSON-LD en la URL oficial; portada y servicios en sitemap; páginas legales, 404 y ejemplos conceptuales con `noindex`.
- No publicar Cloudflare ni modificar Workers Builds sin autorización expresa. Revisar `docs/configuracion-cloudflare-pendiente.md`.
- Supabase: migraciones versionadas; el README señala que la landing todavía dirige a WhatsApp sin guardar leads en base de datos.
- El HTML de home define GA4 y GTM; comprobar consentimiento y duplicados en navegador antes de afirmar que la medición funciona.
- Auditorías antiguas no equivalen a pruebas vigentes.

## 6. Comandos
```bash
npm ci
npm run dev
npm test
npm run build:dist
npm run validate:dist
npm run build:dist:cloudflare
npm run validate:dist:cloudflare
```
Los builds rechazan directorios de salida no vacíos; usar directorios temporales nuevos o seguir las instrucciones del README. No activar comandos de despliegue sin aprobación.

## 7. Plan por tandas y definición de terminado
### Tanda 1 — Documentación y línea base [P0]
- [ ] Adoptar este SPEC y enlazarlo desde README.
- [ ] Ejecutar suite de tests en copia limpia y registrar resultado exacto.
- [ ] Verificar estructura/estado de `main`, workflows y ajustes remotos; no publicar.
**Terminado:** contexto unificado, pruebas documentadas, cero modificación funcional.

### Tanda 2 — SEO y Search Console [P0]
- [ ] Comprobar robots/sitemap/canonical/metadatos, códigos HTTP y enlaces de ambas URLs indexables.
- [ ] Contrastar el estado real de sitemap/indexación dentro de GSC; corregir solo defectos reproducidos.
- [ ] Mantener canonicals por destino: GitHub Pages con su ruta propia y Cloudflare con la URL oficial temporal.
**Terminado:** validaciones automáticas y evidencias de GSC, sin duplicar indexación.

### Tanda 3 — UX, responsive y accesibilidad [P1]
- [ ] Revisar home y servicios en 320/375/768/1024/1440 px, teclado, foco, menú, formularios, enlaces y botones.
- [ ] Corregir fallos por bloques completos, sin reemplazar logo ni identidad.
- [ ] Probar cookies: rechazar, aceptar, cambiar preferencias y recargar.
**Terminado:** flujos utilizables, no regresiones de test, capturas antes/después.

### Tanda 4 — Conversión y contenido [P1]
- [ ] Verificar textos, paquetes, condiciones, tiempos y CTA; no inventar Premium.
- [ ] Medir clics a WhatsApp y envío de formularios sin duplicidad GA4/GTM y con consentimiento.
- [ ] Definir criterio de lead cualificado; Supabase solo con diseño y autorización independientes.
**Terminado:** CTA funcionales, mensaje de contacto contextual, eventos comprobados.

### Tanda 5 — Rendimiento, seguridad y liberación [P1]
- [ ] Auditar Lighthouse móvil/escritorio, CWV, imágenes, fuentes, errores de consola, enlaces, cabeceras y secretos.
- [ ] Evaluar mejoras concretas sin cambiar el hosting canónico.
- [ ] Validar `npm test` y distribuciones en limpio; preparar PR y plan de reversión.
**Terminado:** checklist completo y aprobación humana **antes** de fusionar/publicar.

## 8. Reglas para asistentes de IA
1. Leer este SPEC, README, `package.json` y archivos afectados antes de editar.
2. Trabajar en rama nueva desde `main`; nunca modificar producción o desplegar sin permiso expreso.
3. Proponer cambios por bloques funcionales completos, indicando archivos y pruebas.
4. No inventar estado de GSC, Cloudflare, Supabase, analítica o precios.
5. Respetar rutas relativas por destino, canonicals por destino y `noindex` de legales, 404 y ejemplos conceptuales.
6. No añadir frameworks ni dependencias sin justificarlo; mantener MVC actual.
7. No publicar secretos; jamás exponer la `SUPABASE_SERVICE_ROLE_KEY`.
8. Entregar resumen, diff, pruebas y riesgos; detenerse antes del merge.

## 9. Prompt reutilizable
> Trabaja sobre ForgeLock usando `SPEC.md` y `README.md` como fuente de contexto. Inspecciona primero el código real de la rama y los tests. Ejecuta únicamente la tanda indicada de la hoja de ruta, trabajando por bloques completos. Mantén diseño, rutas, políticas SEO y límites de despliegue. Devuelve cambios verificables, lista de archivos, pruebas, riesgos y un PR para revisión; no hagas merge ni deploy sin mi aprobación.

## 10. Referencias
- `README.md`
- `docs/seo-cloudflare-transition.md`
- `docs/configuracion-cloudflare-pendiente.md`
- `docs/seo-audit.md` (histórica)

