# Reproducción y corrección de navegación y servicios — 30 de octubre de 2026

## Alcance y evidencia de entrada

Se leyeron `README.md`, `SPEC.md`, `docs/auditoria-maestra-2026-10-30.md` y `docs/configuracion-cloudflare-pendiente.md` antes de editar. El video mencionado en la solicitud no llegó como archivo accesible en el espacio de trabajo ni como contenido reproducible en la conversación; por eso el diagnóstico previo al cambio se contrastó con el HTML servido, los archivos fuente y los recursos locales, además de los tres defectos descritos en la solicitud.

El `30 de octubre de 2026` respondieron `200` estas páginas públicas:

| URL | Título servido antes del cambio | Hallazgo reproducible en el HTML |
|---|---|---|
| `https://forgelock.forge-look19.workers.dev/` | Landing pages para negocios \| ForgeLock | Usaba el favicon raíz y presentaba el CTA «Ver servicios» hacia el carrusel de soluciones. |
| `https://forgelock.forge-look19.workers.dev/servicios` | Planes de landing pages \| ForgeLock | El H1 trataba de landing pages; no existían pestañas de servicio. |
| `https://forgelock-solution.github.io/ForgeLock/` | Landing pages para negocios \| ForgeLock | Mismo orden de navegación y CTA de la portada. |
| `https://forgelock-solution.github.io/ForgeLock/servicios.html` | Planes de landing pages \| ForgeLock | La ficha cargaba el mismo contenido orientado a landing. |

## Pasos de reproducción del estado anterior

1. Abrir la portada local (`http://localhost:3001/`) o cualquiera de las portadas públicas y buscar «Servicios». La navegación de inicio apuntaba a la sección local; el CTA del hero saltaba al carrusel, no a la ficha donde consultar las opciones.
2. Abrir Servicios en `375 px` o menos. En `servicios.html` la navegación interna estaba oculta bajo `sm`; el encabezado de página daba prioridad a landing pages.
3. Desde una tarjeta de servicio de inicio, pulsar «Conocer …». Las tres tarjetas abrían `servicios.html` sin identificar el servicio seleccionado; la ficha mostraba el mismo hero y contenido de landing.
4. En escritorio, la página de servicios mostraba un enlace «Servicios», pero conducía a `index.html#servicios` en vez de mantener al visitante en la ficha de servicios.
5. El favicon local `favicon.ico` y `resource/favicon-16.png`, `-32.png`, `-48.png` no correspondían al candado; los HTML declaraban el ICO y, en portada/servicios, referencias PNG absolutas al Worker.

## Cambios y comprobaciones posteriores

- El símbolo derivado de `Icon-192.png` muestra el candado aprobado y se exportó a 16, 32 y 48 px y al ICO raíz. Inicio, servicios, páginas legales y 404 declaran los recursos locales; el manifiesto incluye el PNG de 48 px y conserva los iconos aprobados de 180 y 192 px.
- La portada ofrece un enlace directo «Explorar servicios» y las tarjetas enlazan al selector con `?servicio=landing|catalogos|branding`.
- La ficha incorpora pestañas `role="tab"`/`role="tabpanel"`, estado `aria-selected`, flechas/Home/End y foco en la selección activa. Para catálogos y branding se muestra solo el contenido del servicio; se ocultan los ejemplos, planes, proceso y preguntas exclusivas de landing.
- La especificación vigente enumera explícitamente solo los planes de landing y deja Premium sin confirmar. Catálogo y branding mantienen su consulta por cotización sin publicar precio, alcance ni plazo; no se encontró una fuente aprobada para otros datos comerciales.
- Edge local ejecutó portada y servicios a `320`, `375`, `768`, `1024` y `1440 px`: sin desbordamiento horizontal, errores de JavaScript/red observados ni infracciones Axe WCAG A/AA seleccionadas. Axe también pasó con cada servicio seleccionado. La secuencia interactiva confirmó el detalle y CTA propios de los tres servicios y que el contenido de landing se oculta al seleccionar catálogo o branding.
- La publicación de GitHub Pages y el Worker se verificó en modo solo lectura el 30 de octubre. El favicon y el selector de servicios de la versión pública ya reflejan los cambios integrados; las modificaciones locales posteriores de esta rama no se publicaron.
- En las fichas públicas de ambas plataformas, el encabezado aún usa `./resource/favicon-48.png` como imagen de marca y el hero mantiene la foto de Unsplash `photo-1460925895917-afdab827c52f`; el cambio local a `resource/isotipo.png` sigue pendiente de publicación. En la portada pública, «Servicios» apunta a `#servicios`, pero el contenido renderizado de `main` no contiene ese ID; este cambio local añade el destino y margen de scroll.

## Aclaración tras la revisión del usuario

- La marca del encabezado y la ilustración principal de `servicios.html` usan el recurso de identidad existente `resource/isotipo.png`; el favicon del navegador conserva sus referencias separadas.
- La ficha de catálogo indica que no hay precio, alcance ni plazo publicados y que se confirman en la cotización. Se retiraron de los cambios locales las afirmaciones de hasta 20 productos, $500.000 COP, 15 días y preparación de fotos por $250.000 COP: no aparecen en la especificación y el catálogo de Drive está en revisión. Branding conserva su consulta por cotización sin entregables, precio ni plazo publicados.
- El enlace de navegación «Servicios» apunta al ID `#servicios` del contenido generado en inicio y el destino incorpora margen para la cabecera fija. El menú móvil incluye el mismo enlace; las tarjetas continúan enlazando cada opción a su ficha con el parámetro `servicio` correspondiente.
- `npm run build:styles`, `npm test` (52 pruebas), `npm run build:dist`, `npm run validate:dist`, `npm run build:dist:cloudflare` y `npm run validate:dist:cloudflare` pasaron. Las dos distribuciones se generaron en carpetas temporales fuera del repositorio. Browserslist mostró un aviso de datos `caniuse-lite` desactualizados.
