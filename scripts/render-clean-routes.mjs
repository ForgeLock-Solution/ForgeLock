// Prepara las rutas limpias y las páginas puente compatibles con GitHub Pages.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { JSDOM } from 'jsdom';
import { SERVICE_CATALOG } from '../src/models/service-catalog.js';
import { escapeHtml } from '../src/views/html-helpers.js';

const PAGES_BASE = 'https://forgelock-solution.github.io/ForgeLock/';

export async function prepareServicesRoute(source, destination) {
    const dom = new JSDOM(await readFile(source, 'utf8'));
    try {
        for (const element of dom.window.document.querySelectorAll('[href], [src]')) {
            for (const attribute of ['href', 'src']) {
                const value = element.getAttribute(attribute);
                if (value?.startsWith('./')) element.setAttribute(attribute, `../${value.slice(2)}`);
            }
        }
        await mkdir(dirname(destination), { recursive: true });
        await writeFile(destination, dom.serialize(), 'utf8');
    } finally {
        dom.window.close();
    }
}

function legacyBridge({ title, canonicalPath, destination }) {
    const canonical = new URL(canonicalPath, PAGES_BASE).href;
    return `<!doctype html>
<html lang="es-CO">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta http-equiv="refresh" content="0; url=${escapeHtml(destination)}">
  <title>${escapeHtml(title)} | ForgeLock</title>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <p>Esta página cambió de dirección.</p>
    <p><a href="${escapeHtml(destination)}">Continuar a la página actual</a></p>
  </main>
</body>
</html>
`;
}

export async function renderLegacyBridges(output) {
    await writeFile(join(output, 'servicios.html'), legacyBridge({
        title: 'Servicios',
        canonicalPath: 'servicios/',
        destination: './servicios/'
    }), 'utf8');

    for (const service of SERVICE_CATALOG.filter((item) => item.fichePath && item.legacyFichePath)) {
        await writeFile(join(output, service.legacyFichePath), legacyBridge({
            title: service.name,
            canonicalPath: `servicios/${service.slug}/`,
            destination: `./servicios/${service.slug}/`
        }), 'utf8');
    }
}
