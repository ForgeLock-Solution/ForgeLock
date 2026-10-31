// Renderiza el catálogo y el detalle inicial de servicios en el HTML del build.
import { readFile, writeFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { ServicePageView } from '../src/views/service-page-view.js';

export async function renderServices(path) {
    const dom = new JSDOM(await readFile(path, 'utf8'));
    const previousDocument = globalThis.document;
    try {
        globalThis.document = dom.window.document;
        ServicePageView.renderCatalog();
        ServicePageView.renderLandingPricing();
        document.querySelectorAll('[data-landing-content]').forEach((section) => {
            section.hidden = true;
        });
        await writeFile(path, dom.serialize(), 'utf8');
    } finally {
        if (previousDocument === undefined) delete globalThis.document;
        else globalThis.document = previousDocument;
        dom.window.close();
    }
}
