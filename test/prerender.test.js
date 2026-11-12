import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';
import { parseHtml } from '../scripts/seo-helpers.mjs';

test('la portada puede renderizar contenido indexable desde el HTML inicial', async () => {
  const vite = await createServer({
    configFile: './vite.config.ts',
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent'
  });
  try {
    const { default: App } = await vite.ssrLoadModule('/src/App.tsx');
    const html = renderToString(React.createElement(App));
    const document = parseHtml(html);
    const h1 = [...document.querySelectorAll('main h1')];
    assert.equal(h1.length, 1);
    assert.equal(h1[0].textContent.trim(), 'Soluciones digitales para presentar tu negocio con claridad');
    assert.match(document.body.textContent, /Preguntas frecuentes/);
    assert.ok(document.querySelector('a[href^="https://wa.me/573043402589"]'));
  } finally {
    await vite.close();
  }
});
