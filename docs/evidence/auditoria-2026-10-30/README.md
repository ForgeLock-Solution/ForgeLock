# Evidencias de la auditoría

Fecha: 30 de octubre de 2026. Base: `96f2e42`. Windows, Node 24.20.0, npm 11.19.0, Edge 156.0.0.0 en modo headless, Playwright Core 1.64.1, axe-core 4.14.0 y Lighthouse 13.6.0.

- `tests-before.txt` y `tests-after.txt`: salida real de `npm test`.
- `browser-before.json`: copia limpia de `origin/main`; diez combinaciones de página y ancho.
- `browser-after.json`: artefacto Pages final; mismos anchos, errores, peticiones de Google y resultados axe.
- `flows-after.json`: pruebas en Edge de consentimiento, evento único interceptado, teclado y propuesta.
- `lighthouse-after.json`: métricas finales locales y perfiles. Informes HTML completos permanecen en la carpeta temporal de esta sesión; este resumen no contiene datos de producción.
- `npm-audit.json`: auditoría de dependencias.
- Capturas `*-before.png` / `*-after.png`: primer viewport de 375 × 900 y 1440 × 900, con el aviso de consentimiento visible.

Ejemplos visuales: [inicio antes](index.html-375-before.png), [inicio después](index.html-375-after.png), [servicios antes](servicios.html-1440-before.png), [servicios después](servicios.html-1440-after.png).

## Reproducción de las comprobaciones opcionales de navegador

Los archivos `.cjs` son los runners usados en esta sesión. Requieren Edge instalado en la ruta Windows indicada en ellos. Se ejecutan desde la raíz del repositorio. Instalar sus dependencias en una carpeta temporal y copiar allí los runners evita añadirlas al proyecto:

```powershell
$auditTools = Join-Path $env:TEMP ('forgelock-audit-tools-' + [guid]::NewGuid().ToString('N'))
npm install --prefix $auditTools --no-package-lock playwright-core@1.64.1 axe-core@4.14.0 lighthouse@13.6.0
Copy-Item 'docs/evidence/auditoria-2026-10-30/*.cjs' $auditTools
$auditDist = Join-Path $env:TEMP ('forgelock-audit-pages-' + [guid]::NewGuid().ToString('N'))
$env:DIST_DIR = $auditDist
try { npm run build:dist } finally { Remove-Item Env:DIST_DIR }
node (Join-Path $auditTools 'browser-audit.cjs') $auditDist (Join-Path $auditTools 'browser-results')
node (Join-Path $auditTools 'flow-audit.cjs') $auditDist
node (Join-Path $auditTools 'lighthouse-audit.cjs') $auditDist (Join-Path $auditTools 'lighthouse-results')
node (Join-Path $auditTools 'artifact-audit.cjs') $auditDist
```

Cada runner sirve el artefacto en localhost durante la comprobación. El runner de flujos intercepta los scripts de Google y evita la navegación de los clics a WhatsApp; no envía mensajes ni eventos reales de GA4. El escaneo de artefacto revisa referencias HTML y algunos patrones de secretos; no audita historial, CSS de terceros ni configuración remota. Las puntuaciones pueden variar por equipo y red.
