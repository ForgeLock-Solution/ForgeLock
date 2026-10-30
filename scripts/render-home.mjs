// Reutiliza las vistas MVC durante el build para entregar el contenido inicial
// sin esperar a los módulos del navegador. No registra eventos ni carga servicios.
import { readFile, writeFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { AppView } from '../src/views/app-view.js';
import { IdeaGeneratorView } from '../src/views/idea-generator-view.js';

export async function renderHome(path) {
    const dom = new JSDOM(await readFile(path, 'utf8'));
    const previousDocument = globalThis.document;
    try {
        globalThis.document = dom.window.document;
        for (const method of ['renderHeader', 'renderHero', 'renderSolutions', 'renderNeedFinder',
            'renderServices', 'renderWorkflow', 'renderHelpAndCta', 'renderFooter']) AppView[method]();
        IdeaGeneratorView.render(document.querySelector('#idea-generator-container'));
        await writeFile(path, dom.serialize(), 'utf8');
    } finally {
        if (previousDocument === undefined) delete globalThis.document;
        else globalThis.document = previousDocument;
        dom.window.close();
    }
}
