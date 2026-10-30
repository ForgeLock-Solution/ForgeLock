import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

test('los planes publican solo precios y tiempos autorizados con CTA contextual', async () => {
  const html = await readFile(new URL('../servicios.html', import.meta.url), 'utf8');
  const { document } = new JSDOM(html).window;
  const cards = [...document.querySelectorAll('#planes-landing article')];
  assert.equal(cards.length, 2);
  for (const [index, name, price, days] of [[0, 'Landing Básica', '249.000', '3 a 5'], [1, 'Landing Profesional', '449.000', '5 a 7']]) {
    assert.match(cards[index].textContent, new RegExp(name));
    assert.ok(cards[index].textContent.includes(`$${price}`));
    assert.ok(cards[index].textContent.includes(`${days} días hábiles`));
    const url = new URL(cards[index].querySelector('a').href);
    assert.equal(url.hostname, 'wa.me');
    assert.equal(url.pathname, '/573043402589');
    assert.ok(url.searchParams.get('text').includes(name));
    assert.ok(url.searchParams.get('text').includes(price));
  }
  assert.doesNotMatch(document.querySelector('#planes-landing').textContent, /Premium|\?/);
});

test('la página de servicios presenta solo la oferta autorizada y CTA de WhatsApp', async () => {
  const html = await readFile(new URL('../servicios.html', import.meta.url), 'utf8');
  assert.match(html, /<title>Planes de landing pages \| ForgeLock<\/title>/);
  assert.match(html, /Landing pages para presentar tu negocio/);
  assert.match(html, /Catálogos digitales/);
  assert.match(html, /Branding y diseño digital/);
  assert.doesNotMatch(html, /Automatización de WhatsApp|Sistemas y automatización|Soluciones personalizadas|CRM|pasarelas de pago/);
  assert.match(html, /Ejemplo conceptual de diseño/);
  assert.doesNotMatch(html, /photo-1547658788-1b9d4f3c2e9f|photo-1634942536790-2536c7f6f5f0/);
  assert.match(html, /<iframe[^>]+title="[^"]+"/);
  assert.match(html, /class="[^"]*whatsapp-button/);
  assert.match(html, /https:\/\/wa\.me\/573043402589/);
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
});

test('el cargador de GA permite reintentar si el script remoto falla', async () => {
  const html = await readFile(new URL('../src/services/consent.js', import.meta.url), 'utf8');
  assert.match(html, /script\.onload = function/);
  assert.match(html, /script\.onerror = function/);
  assert.match(html, /window\.__FORGELOCK_GA_LOADING = false/);
  assert.match(html, /analytics_consent_granted/);
  assert.match(html, /forgelock_analytics_consent/);
});
