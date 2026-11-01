import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

test('el menú móvil, los enlaces de WhatsApp y el footer permanecen operativos', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'https://forgelock-solution.github.io/ForgeLock/'
  });
  const globals = ['window', 'document', 'navigator', 'HTMLElement', 'Node', 'CustomEvent', 'localStorage', 'IS_REACT_ACT_ENVIRONMENT'];
  const previous = new Map(globals.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(dom.window.HTMLElement.prototype, { scrollIntoView() {} });
  for (const key of globals) {
    const value = key === 'IS_REACT_ACT_ENVIRONMENT' ? true : (key === 'localStorage' ? dom.window.localStorage : dom.window[key]);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }

  const vite = await createServer({ configFile: './vite.config.ts', server: { middlewareMode: true }, appType: 'custom' });
  let root;
  try {
    const { App } = await vite.ssrLoadModule('/src/App.tsx');
    const container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => { root.render(React.createElement(App)); });

    const menuToggle = [...document.querySelectorAll('button')].find((button) => button.getAttribute('aria-label') === 'Abrir menú');
    assert.ok(menuToggle, 'el control del menú móvil debe existir');
    await act(async () => { menuToggle.click(); });
    assert.ok(document.querySelector('#mobile-menu'), 'el menú móvil debe abrirse');

    const servicesLink = document.querySelector('#mobile-menu a[href="#servicios"]');
    assert.ok(servicesLink, 'el menú móvil debe enlazar al catálogo');
    await act(async () => { servicesLink.click(); });
    assert.equal(document.querySelector('#mobile-menu'), null, 'el menú móvil debe cerrarse después de navegar');

    const whatsappLinks = [...document.querySelectorAll('a[href^="https://wa.me/"]')];
    assert.ok(whatsappLinks.length >= 2, 'deben permanecer los enlaces de WhatsApp de la app y el pie');
    assert.ok(whatsappLinks.every((link) => new URL(link.href).pathname === '/573043402589'));
    assert.equal(document.querySelector('footer a[href="./aviso-legal.html"]')?.textContent.trim(), 'Aviso legal');
    assert.equal(document.querySelector('footer a[href="./politica-privacidad.html"]')?.textContent.trim(), 'Privacidad');
    assert.equal(document.querySelector('footer a[href="./politica-cookies.html"]')?.textContent.trim(), 'Cookies');

  } finally {
    if (root) await act(async () => { root.unmount(); });
    await vite.close();
    dom.window.close();
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
