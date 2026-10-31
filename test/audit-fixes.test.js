import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { ServicePageView } from '../src/views/service-page-view.js';
import { SERVICE_CATALOG } from '../src/models/service-catalog.js';

test('los planes publican solo precios y tiempos autorizados con CTA contextual', async () => {
  const html = await readFile(new URL('../servicios.html', import.meta.url), 'utf8');
  const dom = new JSDOM(html);
  globalThis.document = dom.window.document;
  ServicePageView.renderLandingPricing();
  const { document } = dom.window;
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
  dom.window.close();
});

test('la página de servicios presenta solo la oferta autorizada y CTA de WhatsApp', async () => {
  const html = await readFile(new URL('../servicios.html', import.meta.url), 'utf8');
  const dom = new JSDOM(html);
  globalThis.document = dom.window.document;
  ServicePageView.renderCatalog('landing');
  ServicePageView.renderLandingPricing();
  ServicePageView.update('landing');
  const rendered = dom.serialize();
  assert.match(rendered, /<title>Servicios digitales para negocios \| ForgeLock<\/title>/);
  assert.match(rendered, /Landing pages para presentar tu negocio/);
  assert.match(rendered, /Catálogos digitales/);
  assert.match(rendered, /Branding y diseño digital/);
  assert.match(rendered, /Automatización de WhatsApp/);
  assert.match(rendered, /Conectamos plataformas, pasarelas de pago, CRMs y herramientas/);
  assert.match(rendered, /Ejemplo conceptual de diseño/);
  assert.doesNotMatch(rendered, /photo-1547658788-1b9d4f3c2e9f|photo-1634942536790-2536c7f6f5f0/);
  assert.match(rendered, /<iframe[^>]+title="[^"]+"/);
  assert.match(rendered, /class="[^"]*whatsapp-button/);
  assert.match(rendered, /https:\/\/wa\.me\/573043402589/);
  assert.doesNotMatch(rendered, /20 productos|15 días hábiles|250\.000 COP|500\.000 COP/);
  assert.match(rendered, /Cotiza según tu necesidad/);
  for (const service of SERVICE_CATALOG) {
    ServicePageView.update(service.id);
    assert.equal(dom.window.document.querySelector('#detalle-descripcion').textContent, service.description);
    assert.ok(dom.window.document.querySelector('#detalle-informacion').textContent.length > 0);
    assert.ok(dom.window.document.querySelector('#detalle-cta').href.includes(encodeURIComponent(service.message)));
  }
  ServicePageView.update('catalogos');
  assert.match(dom.window.document.querySelector('#detalle-informacion').textContent, /No hay precio, alcance ni plazo publicados/);
  ServicePageView.update('branding');
  assert.match(dom.window.document.querySelector('#detalle-informacion').textContent, /No hay precio ni entregables publicados/);
  assert.match(dom.window.document.querySelector('#detalle-informacion').textContent, /el alcance se define antes de comenzar/);
  const serviceModel = await readFile(new URL('../src/models/service-catalog.js', import.meta.url), 'utf8');
  assert.match(serviceModel, /No hay precio, alcance ni plazo publicados; se confirman en la cotización/);
  assert.doesNotMatch(serviceModel, /hasta 20 productos|500\.000 COP|15 días hábiles|250\.000 COP/);
  assert.match(rendered, /target="_blank" rel="noopener noreferrer"/);
  dom.window.close();
});

test('el cargador de GA permite reintentar si el script remoto falla', async () => {
  const html = await readFile(new URL('../src/services/consent.js', import.meta.url), 'utf8');
  assert.match(html, /script\.onload = function/);
  assert.match(html, /script\.onerror = function/);
  assert.match(html, /window\.__FORGELOCK_GA_LOADING = false/);
  assert.match(html, /analytics_consent_granted/);
  assert.match(html, /forgelock_analytics_consent/);
});
