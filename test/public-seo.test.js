import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { auditPublicSeo } from '../scripts/check-public-seo.mjs';
import { parseSitemapLocations, SITEMAP_NAMESPACE } from '../scripts/seo-helpers.mjs';

const baseUrl = new URL('https://example.test/ForgeLock/');
const homeUrl = baseUrl.href;
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="${SITEMAP_NAMESPACE}">
  <url><loc>${homeUrl}</loc></url>
</urlset>`;

test('parseSitemapLocations valida XML, URLs canónicas, duplicados y lastmod', () => {
  assert.deepEqual(parseSitemapLocations(sitemapXml, baseUrl).locations, [homeUrl]);
  assert.throws(() => parseSitemapLocations('<urlset/>', baseUrl), /codificación UTF-8/);
  assert.throws(() => parseSitemapLocations(sitemapXml.replace(homeUrl, 'https://other.test/'), baseUrl), /fuera de la base/);
  assert.throws(() => parseSitemapLocations(sitemapXml.replace(
    '</urlset>',
    `<url><loc>${homeUrl}</loc></url></urlset>`
  ), baseUrl), /URL duplicada/);
  assert.throws(() => parseSitemapLocations(sitemapXml.replace(
    '</loc></url>',
    '</loc><lastmod>2026-02-30</lastmod></url>'
  ), baseUrl), /lastmod inválido/);
});

test('audita páginas y puentes públicos y advierte si falta el robots global', async () => {
  const dist = await mkdtemp(join(tmpdir(), 'forgelock-public-seo-'));
  const sitemapUrl = new URL('sitemap.xml', baseUrl).href;
  const rootRobotsUrl = new URL('/robots.txt', baseUrl.origin).href;
  const projectRobotsUrl = new URL('robots.txt', baseUrl).href;
  const bridgeUrl = new URL('legacy.html', baseUrl).href;
  const page = `<!doctype html><html><head><meta name="robots" content="index,follow"><link rel="canonical" href="${homeUrl}"></head><body></body></html>`;
  const bridge = `<!doctype html><html><head><meta name="robots" content="noindex,follow"><link rel="canonical" href="${homeUrl}"><meta http-equiv="refresh" content="0; url=./"></head><body><main><a href="./">Continuar</a></main></body></html>`;

  try {
    await mkdir(dist, { recursive: true });
    await writeFile(join(dist, 'sitemap.xml'), sitemapXml, 'utf8');
    await writeFile(join(dist, 'index.html'), page, 'utf8');
    await writeFile(join(dist, 'legacy.html'), bridge, 'utf8');

    const fetchImpl = async (input) => {
      const url = new URL(input).href;
      if (url === rootRobotsUrl) return new Response(null, { status: 404 });
      if (url === projectRobotsUrl) {
        return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`, {
          status: 200,
          headers: { 'content-type': 'text/plain; charset=utf-8' }
        });
      }
      if (url === sitemapUrl) {
        return new Response(sitemapXml, { status: 200, headers: { 'content-type': 'application/xml' } });
      }
      if (url === homeUrl) return new Response(page, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
      if (url === bridgeUrl) return new Response(bridge, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
      throw new Error(`Unexpected request: ${url}`);
    };

    const result = await auditPublicSeo({ dist, baseUrl, fetchImpl });
    assert.deepEqual(result.failures, []);
    assert.equal(result.checkedPages.length, 1);
    assert.equal(result.checkedBridges, 1);
    assert.equal(result.warnings.length, 1);
    assert.match(result.warnings[0], /robots\.txt.*no controla la raíz/);
  } finally {
    await rm(dist, { recursive: true, force: true });
  }
});

test('la auditoría pública rechaza el sitemap servido como HTML', async () => {
  const dist = await mkdtemp(join(tmpdir(), 'forgelock-public-seo-'));
  const sitemapUrl = new URL('sitemap.xml', baseUrl).href;
  const rootRobotsUrl = new URL('/robots.txt', baseUrl.origin).href;
  const projectRobotsUrl = new URL('robots.txt', baseUrl).href;

  try {
    await mkdir(dist, { recursive: true });
    await writeFile(join(dist, 'sitemap.xml'), sitemapXml, 'utf8');
    const fetchImpl = async (input) => {
      const url = new URL(input).href;
      if (url === rootRobotsUrl) return new Response(null, { status: 404 });
      if (url === projectRobotsUrl) {
        return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`, {
          status: 200,
          headers: { 'content-type': 'text/plain' }
        });
      }
      if (url === sitemapUrl) {
        return new Response('<html>Not found</html>', { status: 200, headers: { 'content-type': 'text/html' } });
      }
      throw new Error(`Unexpected request: ${url}`);
    };

    const result = await auditPublicSeo({ dist, baseUrl, fetchImpl });
    assert.ok(result.failures.some((failure) => /Content-Type text\/html; se esperaba XML/.test(failure)));
  } finally {
    await rm(dist, { recursive: true, force: true });
  }
});

test('la auditoría detecta recursos publicados bloqueados por el robots global', async () => {
  const dist = await mkdtemp(join(tmpdir(), 'forgelock-public-seo-'));
  const sitemapUrl = new URL('sitemap.xml', baseUrl).href;
  const rootRobotsUrl = new URL('/robots.txt', baseUrl.origin).href;
  const projectRobotsUrl = new URL('robots.txt', baseUrl).href;
  const page = `<!doctype html><html><head><meta name="robots" content="index,follow"><link rel="canonical" href="${homeUrl}"></head><body></body></html>`;

  try {
    await mkdir(join(dist, 'assets'), { recursive: true });
    await writeFile(join(dist, 'sitemap.xml'), sitemapXml, 'utf8');
    await writeFile(join(dist, 'index.html'), page, 'utf8');
    await writeFile(join(dist, 'assets', 'app.js'), 'export {};', 'utf8');
    const fetchImpl = async (input) => {
      const url = new URL(input).href;
      if (url === rootRobotsUrl) {
        return new Response(`User-agent: *\nDisallow: /ForgeLock/assets/\n\nSitemap: ${sitemapUrl}\n`, {
          status: 200,
          headers: { 'content-type': 'text/plain' }
        });
      }
      if (url === projectRobotsUrl) {
        return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`, {
          status: 200,
          headers: { 'content-type': 'text/plain' }
        });
      }
      if (url === sitemapUrl) return new Response(sitemapXml, { status: 200, headers: { 'content-type': 'application/xml' } });
      if (url === homeUrl) return new Response(page, { status: 200, headers: { 'content-type': 'text/html' } });
      throw new Error(`Unexpected request: ${url}`);
    };

    const result = await auditPublicSeo({ dist, baseUrl, fetchImpl });
    assert.ok(result.failures.some((failure) =>
      failure.includes('/ForgeLock/assets/app.js') && failure.includes('robots del origen')
    ));
  } finally {
    await rm(dist, { recursive: true, force: true });
  }
});
