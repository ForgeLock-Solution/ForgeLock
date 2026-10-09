import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('el consentimiento sigue funcionando si localStorage está bloqueado', () => {
    const dom = new JSDOM(html, {
        url: 'https://forgelock-solution.github.io/ForgeLock/',
        runScripts: 'dangerously',
        beforeParse(window) {
            Object.defineProperty(window, 'localStorage', {
                configurable: true,
                get() {
                    throw new window.DOMException('Storage is blocked', 'SecurityError');
                }
            });
        }
    });

    const { document } = dom.window;
    const banner = document.querySelector('#cookie-consent');
    assert.ok(banner);
    assert.equal(banner.classList.contains('hidden'), false);

    assert.doesNotThrow(() => document.querySelector('#cookie-reject').click());
    assert.equal(banner.classList.contains('hidden'), true);

    banner.classList.remove('hidden');
    assert.doesNotThrow(() => document.querySelector('#cookie-accept').click());
    assert.equal(banner.classList.contains('hidden'), true);
    assert.ok(document.querySelector('script[src*="googletagmanager.com/gtag/js"]'));

    dom.window.close();
});
