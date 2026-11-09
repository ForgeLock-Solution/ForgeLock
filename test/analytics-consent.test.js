import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_STORAGE_KEY,
  GA_MEASUREMENT_ID,
  GTM_CONTAINER_ID,
  installAnalyticsConsent
} from '../src/services/analyticsConsent.ts';

function makeWindow() {
  return new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    url: 'https://forgelock-solution.github.io/ForgeLock/'
  }).window;
}

test('GA4 y GTM no cargan hasta aceptar la preferencia persistida', () => {
  const browser = makeWindow();
  const cleanup = installAnalyticsConsent(browser);
  assert.equal(browser.document.querySelectorAll('script[data-forgelock-analytics]').length, 0);

  browser.localStorage.setItem(CONSENT_STORAGE_KEY, 'rejected');
  browser.dispatchEvent(new browser.CustomEvent(CONSENT_CHANGE_EVENT, { detail: { accepted: false } }));
  assert.equal(browser.document.querySelectorAll('script[data-forgelock-analytics]').length, 0);

  browser.localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted');
  browser.dispatchEvent(new browser.CustomEvent(CONSENT_CHANGE_EVENT, { detail: { accepted: true } }));
  const scripts = [...browser.document.querySelectorAll('script[data-forgelock-analytics]')];
  assert.deepEqual(scripts.map((script) => script.dataset.forgelockAnalytics), ['ga4', 'gtm']);
  assert.equal(scripts[0].src, `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`);
  assert.equal(scripts[1].src, `https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`);

  cleanup();
  browser.close();
});

test('una preferencia aceptada guardada inicia analytics y el rechazo revoca consentimiento', () => {
  const browser = makeWindow();
  browser.localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted');
  const cleanup = installAnalyticsConsent(browser);
  assert.equal(browser.document.querySelectorAll('script[data-forgelock-analytics]').length, 2);

  browser.dispatchEvent(new browser.CustomEvent(CONSENT_CHANGE_EVENT, { detail: { accepted: false } }));
  assert.ok(browser.dataLayer.some((entry) => entry[0] === 'consent' && entry[1] === 'update' && entry[2].analytics_storage === 'denied'));
  cleanup();
  browser.close();
});

test('si localStorage está bloqueado analytics permanece apagado', () => {
  const browser = makeWindow();
  Object.defineProperty(browser, 'localStorage', { get() { throw new Error('blocked'); } });
  const cleanup = installAnalyticsConsent(browser);
  assert.equal(browser.document.querySelectorAll('script[data-forgelock-analytics]').length, 0);
  cleanup();
  browser.close();
});
