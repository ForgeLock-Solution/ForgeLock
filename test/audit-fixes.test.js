import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('la página de servicios tiene descripciones, imágenes con alt y enlaces WhatsApp destacados', async () => {
  const html = await readFile(new URL('../servicios.html', import.meta.url), 'utf8');
  assert.match(html, /<title>Servicios digitales para negocios \| ForgeLock Solution<\/title>/);
  assert.match(html, /Páginas web y landing pages/);
  assert.match(html, /Catálogos digitales/);
  assert.match(html, /Branding y diseño digital/);
  assert.match(html, /Sistemas y automatización/);
  assert.doesNotMatch(html, /photo-1547658788-1b9d4f3c2e9f|photo-1634942536790-2536c7f6f5f0/);
  assert.match(html, /service-image-fallback/);
  assert.match(html, /alt="[^"]+"/);
  assert.match(html, /class="[^"]*whatsapp-button/);
  assert.match(html, /https:\/\/wa\.me\/573043402589/);
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
});

test('el cargador de GA permite reintentar si el script remoto falla', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /script\.onload = function/);
  assert.match(html, /script\.onerror = function/);
  assert.match(html, /window\.__FORGELOCK_GA_LOADING = false/);
  assert.match(html, /analytics_consent_granted/);
  assert.match(html, /forgelock_analytics_consent/);
});
