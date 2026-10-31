import assert from 'node:assert/strict';
import test from 'node:test';
import { SERVICE_CATALOG, WHATSAPP_NUMBER, getWhatsAppUrl, formatPrice } from '../src/data/services.ts';
import { AIService } from '../src/services/aiService.ts';

test('El catálogo de servicios de ForgeLock tiene los 9 servicios oficiales', () => {
  assert.equal(SERVICE_CATALOG.length, 9);
  const landing = SERVICE_CATALOG.find((s) => s.id === 'landing');
  assert.ok(landing);
  assert.equal(landing.pricing?.length, 2);
  assert.equal(landing.pricing[0].name, 'Landing Básica');
  assert.equal(landing.pricing[0].price, 249000);
  assert.equal(landing.pricing[1].name, 'Landing Profesional');
  assert.equal(landing.pricing[1].price, 449000);
});

test('Formato de precio en pesos colombianos COP', () => {
  const formatted = formatPrice(249000);
  assert.match(formatted, /249\.000/);
  assert.match(formatted, /COP/);
});

test('Generación de enlace de WhatsApp con número oficial', () => {
  const url = getWhatsAppUrl('Hola prueba', WHATSAPP_NUMBER);
  assert.equal(url, 'https://wa.me/573043402589?text=Hola%20prueba');
});

test('Análisis heurístico de idea genera propuesta estructurada', () => {
  const input = 'Necesito una página para mi barbería llamada Barber King, con servicios, fotos, ubicación y WhatsApp.';
  const proposal = AIService.heuristicAnalysis(input);
  assert.equal(proposal.businessName, 'Barber King');
  assert.match(proposal.sector, /Barbería/i);
  assert.ok(proposal.pageStructure.length > 0);
  assert.ok(proposal.functionalities.length > 0);
  
  const link = AIService.getWhatsAppLink(input, proposal, WHATSAPP_NUMBER);
  assert.match(link, /573043402589/);
  assert.match(decodeURIComponent(link), /Barber King/);
});
