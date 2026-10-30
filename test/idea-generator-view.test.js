import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { IdeaGeneratorView } from '../src/views/idea-generator-view.js';

test('la propuesta muestra contenido HTML como texto sin crear elementos', () => {
    const dom = new JSDOM('<div id="idea-generator-container"></div>');
    const previousDocument = globalThis.document;
    globalThis.document = dom.window.document;
    try {
        IdeaGeneratorView.render(document.querySelector('#idea-generator-container'));
        const text = '<img src="x" onerror="alert(1)"> & "marca" \'local\'';
        IdeaGeneratorView.updatePreview({
            businessName: text,
            sector: text,
            objective: text,
            visualStyle: text,
            colorsSuggested: text,
            pageStructure: [text],
            functionalities: [text],
            callToAction: text,
            pendingInfo: text
        });
        const preview = document.querySelector('#preview-content');
        assert.equal(preview.querySelector('h3 span').textContent, text);
        assert.equal(preview.querySelectorAll('img, script, [onerror]').length, 0);
        assert.equal(preview.querySelectorAll('li').length, 2);
        for (const item of preview.querySelectorAll('li')) assert.equal(item.lastElementChild.textContent, text);
        assert.equal(document.querySelector('#badge-status').textContent, 'Propuesta lista');
    } finally {
        globalThis.document = previousDocument;
        dom.window.close();
    }
});

test('los campos opcionales vacíos no muestran null ni undefined en la propuesta', () => {
    const dom = new JSDOM('<div id="idea-generator-container"></div>');
    const previousDocument = globalThis.document;
    globalThis.document = dom.window.document;
    try {
        IdeaGeneratorView.render(document.querySelector('#idea-generator-container'));
        IdeaGeneratorView.updatePreview({ businessName: null, sector: undefined, pageStructure: [], functionalities: [] }, true);
        const preview = document.querySelector('#preview-content');
        assert.equal(preview.querySelector('h3 span').textContent, '');
        assert.doesNotMatch(preview.textContent, /null|undefined/);
        assert.equal(document.querySelector('#badge-status').textContent, 'Borrador en vivo');
    } finally {
        globalThis.document = previousDocument;
        dom.window.close();
    }
});
