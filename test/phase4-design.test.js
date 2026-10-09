import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Fase 4: diseño claro con identidad ForgeLock y contacto intactos', async () => {
  const [html, view] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/app-view.js', import.meta.url), 'utf8')
  ]);
  assert.match(html, /id="services-container" class="py-20 bg-white"/);
  assert.match(html, /id="solutions-carousel-container" class="py-20 bg-slate-50"/);
  assert.match(view, /\.\/resource\/favicon-48\.png/);
  assert.match(view, /wa\.me\/\$\{AppModel\.state\.whatsappNumber\}/);
  assert.match(view, /Servicios digitales claros, pensados para crecer/);
  assert.doesNotMatch(view, /text-white|bg-slate-950|bg-slate-900/);
});
