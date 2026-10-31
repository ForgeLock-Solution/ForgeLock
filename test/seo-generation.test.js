import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { generateSeo } from '../scripts/generate-seo.mjs';
import {
  DEFAULT_BASE_URL,
  SITEMAP_NAMESPACE,
  comparePublicHtmlFiles,
  discoverPublicHtmlFiles,
  getSitemapRobotsBlockers,
  getSeoConfig,
  escapeXml,
  getGoogleVerificationValues,
  isValidLastmod,
  isRobotsPathAllowed,
  normalizeBaseUrl,
  parseXmlDocument,
  validateSitemapUrlChildren
} from '../scripts/seo-helpers.mjs';

async function withFixture(run) {
  const root = await mkdtemp(join(tmpdir(), 'forgelock-seo-'));
  const dist = join(root, 'dist');
  await mkdir(dist, { recursive: true });
  const baseUrl = new URL(DEFAULT_BASE_URL);

  async function addPage(file, { noindex = false, verification = false } = {}) {
    const route = file === 'index.html' ? '' : file;
    const canonical = new URL(route, baseUrl).href;
    const robots = noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow">';
    const tag = verification ? '<meta name="google-site-verification" content="fixture-verification-value">' : '';
    const html = `<!doctype html><html><head>${robots}${tag}<link rel="canonical" href="${canonical}"></head><body>fixture</body></html>`;
    await writeFile(join(dist, file), html, 'utf8');
    return html;
  }

  try {
    await run({ root, dist, baseUrl, addPage });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

function parseSitemap(xml) {
  const document = new JSDOM(xml, { contentType: 'application/xml' }).window.document;
  assert.equal(document.documentElement.localName, 'urlset');
  assert.equal(document.documentElement.namespaceURI, SITEMAP_NAMESPACE);
  return document;
}

test('cada destino genera sus señales SEO con su propia URL canónica', () => {
  const pages = getSeoConfig({});
  const worker = getSeoConfig({ SEO_TARGET: 'cloudflare' });
  assert.equal(pages.indexable, true);
  assert.equal(worker.indexable, false);
  assert.equal(worker.baseUrl.href, 'https://forgelock.forge-look19.workers.dev/');
  assert.equal(worker.canonicalBaseUrl.href, 'https://forgelock.forge-look19.workers.dev/');
  assert.equal(worker.canonicalTarget, 'cloudflare');
  assert.throws(() => getSeoConfig({ SEO_TARGET: 'cloudflare', INDEXABLE: 'true' }), /INDEXABLE=true no está permitido/);
  assert.throws(() => getSeoConfig({ SEO_TRANSITION: 'cloudflare' }), /Migración canónica deshabilitada/);
});

test('la API del generador mantiene noindex en Cloudflare y rechaza una base no configurada', async () => {
  await withFixture(async ({ root, dist, addPage }) => {
    const original = await addPage('index.html');
    const result = await generateSeo({ root, dist, env: { SEO_TARGET: 'cloudflare' } });
    assert.equal(result.pageCount, 0);
    assert.match(await readFile(join(dist, 'index.html'), 'utf8'), /canonical" href="https:\/\/forgelock\.forge-look19\.workers\.dev\//);
    assert.match(await readFile(join(dist, 'index.html'), 'utf8'), /noindex,follow/);
    assert.doesNotMatch(result.sitemap, /<loc>/);
    assert.doesNotMatch(result.robots, /^Sitemap:/m);
    await assert.rejects(generateSeo({ root, dist, env: { SEO_TARGET: 'cloudflare' }, indexable: true }), /no se puede solicitar indexación/);
    await assert.rejects(generateSeo({ root, dist, baseUrl: 'https://example.test/' }), /baseUrl no coincide/);
    assert.notEqual(await readFile(join(dist, 'index.html'), 'utf8'), original);
  });
});

test('genera sitemap desde las páginas HTML canónicas e indexables de dist', async () => {
  await withFixture(async ({ root, dist, baseUrl, addPage }) => {
    const sourceIndex = await addPage('index.html', { verification: true });
    await addPage('servicios.html');
    await addPage('acerca.html');
    await addPage('oferta&a.html');
    await addPage('aviso-legal.html', { noindex: true });
    await addPage('404.html', { noindex: true });

    const result = await generateSeo({
      root,
      dist,
      baseUrl: baseUrl.href,
      getLastModified: (file) => ({
        'index.html': '2026-10-27',
        'servicios.html': '2026-02-30',
        'acerca.html': '2026-10-21'
      })[file] ?? ''
    });

    const document = parseSitemap(result.sitemap);
    const urls = [...document.getElementsByTagNameNS(SITEMAP_NAMESPACE, 'url')];
    const locations = urls.map((url) => url.getElementsByTagNameNS(SITEMAP_NAMESPACE, 'loc')[0].textContent);
    assert.deepEqual(locations, [
      new URL('', baseUrl).href,
      new URL('acerca.html', baseUrl).href,
      new URL('oferta&a.html', baseUrl).href,
      new URL('servicios.html', baseUrl).href
    ]);
    assert.ok(locations.every((location) => location.startsWith(baseUrl.href)));
    assert.equal(urls[0].getElementsByTagNameNS(SITEMAP_NAMESPACE, 'lastmod')[0].textContent, '2026-10-27');
    assert.equal(urls[1].getElementsByTagNameNS(SITEMAP_NAMESPACE, 'lastmod')[0].textContent, '2026-10-21');
    assert.equal(urls[2].getElementsByTagNameNS(SITEMAP_NAMESPACE, 'lastmod').length, 0);
    assert.equal(urls[3].getElementsByTagNameNS(SITEMAP_NAMESPACE, 'lastmod').length, 0);
    assert.match(result.sitemap, /oferta&amp;a\.html/);
    assert.equal(result.sitemap.includes('forge-look19.workers.dev'), false);
    assert.equal(result.pageCount, 4);
    assert.equal(result.robots.includes(`Sitemap: ${new URL('sitemap.xml', baseUrl).href}`), true);
    assert.deepEqual(getGoogleVerificationValues(await readFile(join(dist, 'index.html'), 'utf8')),
      getGoogleVerificationValues(sourceIndex));
    assert.equal((await readFile(join(dist, 'aviso-legal.html'), 'utf8')).includes('noindex,follow'), true);
    assert.equal(locations.some((location) => location.includes('aviso-legal') || location.includes('404.html')), false);
  });
});

test('escapa caracteres XML y acepta solo fechas reales YYYY-MM-DD', () => {
  assert.equal(escapeXml('https://example.test/a&b<"c">'), 'https://example.test/a&amp;b&lt;&quot;c&quot;&gt;');
  assert.equal(isValidLastmod('2026-10-27'), true);
  assert.equal(isValidLastmod('2026-02-30'), false);
  assert.equal(isValidLastmod('2026-1-2'), false);
  assert.equal(isValidLastmod(''), false);
  assert.equal(normalizeBaseUrl('https://example.test/ForgeLock').href, 'https://example.test/ForgeLock/');
  assert.throws(() => normalizeBaseUrl('https://example.test/?'), /query ni fragmento/);
});

test('omite lastmod si Git no puede aportar una fecha', async () => {
  await withFixture(async ({ root, dist, baseUrl, addPage }) => {
    await addPage('index.html');
    await generateSeo({ root, dist, baseUrl: baseUrl.href });
    const document = parseSitemap(await readFile(join(dist, 'sitemap.xml'), 'utf8'));
    assert.equal(document.getElementsByTagNameNS(SITEMAP_NAMESPACE, 'lastmod').length, 0);
  });
});

test('falla explícitamente si no quedan páginas canónicas indexables', async () => {
  await withFixture(async ({ root, dist, baseUrl, addPage }) => {
    await addPage('aviso-legal.html', { noindex: true });
    await addPage('404.html', { noindex: true });
    await assert.rejects(
      generateSeo({ root, dist, baseUrl: baseUrl.href }),
      /No se encontraron páginas públicas/
    );
  });
});

test('INDEXABLE=false reemplaza directivas robots en conflicto y no publica URL', async () => {
  await withFixture(async ({ root, dist, baseUrl, addPage }) => {
    await addPage('index.html');
    await writeFile(join(dist, 'index.html'), '<!doctype html><html><head><meta name="robots" content="index,follow"><meta name="robots" content="follow"></head><body></body></html>');
    const result = await generateSeo({ root, dist, baseUrl: baseUrl.href, indexable: false });
    const document = parseSitemap(result.sitemap);
    const html = await readFile(join(dist, 'index.html'), 'utf8');
    assert.equal(document.getElementsByTagNameNS(SITEMAP_NAMESPACE, 'url').length, 0);
    assert.equal(/\bSitemap:/i.test(result.robots), false);
    assert.equal((html.match(/name="robots"/gi) ?? []).length, 1);
    assert.match(html, /noindex,follow/i);
  });
});

test('rechaza una canonical que no corresponde a la URL del entorno', async () => {
  await withFixture(async ({ root, dist, baseUrl, addPage }) => {
    await addPage('index.html');
    await writeFile(join(dist, 'servicios.html'), '<!doctype html><html><head><link rel="canonical" href="https://example.test/servicios.html"></head><body></body></html>');
    await assert.rejects(
      generateSeo({ root, dist, baseUrl: baseUrl.href, getLastModified: () => '' }),
      /canonical propia/
    );
  });
});

test('detecta una página pública nueva del origen que falta en dist', async () => {
  await withFixture(async ({ root, dist, addPage }) => {
    await addPage('index.html');
    await writeFile(join(root, 'index.html'), '<html></html>');
    await writeFile(join(root, 'nueva-publica.html'), '<html></html>');
    const source = await discoverPublicHtmlFiles(root);
    const artifact = await discoverPublicHtmlFiles(dist);
    assert.deepEqual(comparePublicHtmlFiles(source, artifact), {
      missing: ['nueva-publica.html'],
      unexpected: []
    });
  });
});

test('rechaza explícitamente HTML anidado y mantiene fuera HTML en carpetas de pruebas', async () => {
  await withFixture(async ({ root }) => {
    await mkdir(join(root, 'test'), { recursive: true });
    await writeFile(join(root, 'test', 'fixture.html'), '<html></html>');
    await mkdir(join(root, 'pages'), { recursive: true });
    await writeFile(join(root, 'pages', 'anidada.html'), '<html></html>');
    await assert.rejects(discoverPublicHtmlFiles(root), /páginas HTML anidadas/);
  });
});

test('evalúa robots por grupo y precedencia de ruta sin confundir comentarios', () => {
  const robots = `# Disallow: /\nUser-agent: *\nDisallow: /ForgeLock/private/\nAllow: /ForgeLock/private/public/\n\nUser-agent: OtherBot\nDisallow: /\n`;
  assert.equal(isRobotsPathAllowed(robots, '/ForgeLock/index.html', '*'), true);
  assert.equal(isRobotsPathAllowed(robots, '/ForgeLock/private/page.html', '*'), false);
  assert.equal(isRobotsPathAllowed(robots, '/ForgeLock/private/public/page.html', '*'), true);
  assert.equal(isRobotsPathAllowed(robots, '/ForgeLock/private/page.html', 'Googlebot'), false);
  assert.equal(isRobotsPathAllowed(robots, '/ForgeLock/private/page.html', 'OtherBot'), false);
  const distinct = 'User-agent: *\nAllow: /\n\nUser-agent: Googlebot\nDisallow: /ForgeLock/';
  assert.equal(isRobotsPathAllowed(distinct, '/ForgeLock/index.html', '*'), true);
  assert.equal(isRobotsPathAllowed(distinct, '/ForgeLock/index.html', 'Googlebot'), false);
  const sitemapPath = new URL('servicios.html', DEFAULT_BASE_URL).pathname;
  assert.equal(isRobotsPathAllowed(`User-agent: *\nDisallow: /*servicios.html$`, sitemapPath, '*'), false);
});

test('valida * y Googlebot además de cada User-agent explícito, respetando sus grupos', () => {
  const path = new URL('servicios.html', DEFAULT_BASE_URL).pathname;
  const otherAgentBlocks = `# Disallow: /ForgeLock/\nUser-agent: *\nAllow: /ForgeLock/\n\nUser-agent: ExampleBot\nDisallow: /ForgeLock/`;
  assert.deepEqual(getSitemapRobotsBlockers(otherAgentBlocks, path), ['examplebot']);

  const explicitAllows = `User-agent: *\nDisallow: /ForgeLock/\n\nUser-agent: Googlebot\nAllow: /ForgeLock/\n\nUser-agent: ExampleBot\nAllow: /ForgeLock/`;
  assert.deepEqual(getSitemapRobotsBlockers(explicitAllows, path), ['*']);
  assert.equal(isRobotsPathAllowed(explicitAllows, path, 'Googlebot'), true);
  assert.equal(isRobotsPathAllowed(explicitAllows, path, 'ExampleBot'), true);
});

test('validate-dist rechaza y acepta reglas robots según todos los agentes declarados', async () => {
  const repository = dirname(dirname(fileURLToPath(import.meta.url)));
  const root = await mkdtemp(join(tmpdir(), 'forgelock-validate-dist-'));
  const dist = join(root, 'dist');
  const scripts = join(root, 'scripts');
  const baseUrl = new URL(DEFAULT_BASE_URL);
  const image = new URL('resource/forgelock-social-preview.png', baseUrl).href;
  const html = (canonical, verification = '') => `<!doctype html><html><head><meta name="robots" content="index,follow">${verification}<link rel="canonical" href="${canonical}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${image}"><meta name="twitter:image" content="${image}"></head><body></body></html>`;
  try {
    await mkdir(dist, { recursive: true });
    await mkdir(scripts, { recursive: true });
    await cp(join(repository, 'scripts', 'validate-dist.mjs'), join(scripts, 'validate-dist.mjs'));
    await cp(join(repository, 'scripts', 'seo-helpers.mjs'), join(scripts, 'seo-helpers.mjs'));
    await symlink(join(repository, 'node_modules'), join(root, 'node_modules'), 'junction');

    const index = html(baseUrl.href, '<meta name="google-site-verification" content="peYxRjV0Snt4fmiTcjCgkCfvDrTBws3qGUMy8vJVwjQ">');
    const services = html(new URL('servicios.html', baseUrl).href);
    await writeFile(join(root, 'index.html'), index);
    await writeFile(join(root, 'servicios.html'), services);
    await writeFile(join(dist, 'index.html'), index);
    await writeFile(join(dist, 'servicios.html'), services);
    for (const file of ['site.webmanifest', '_headers', '_redirects', 'favicon.ico', 'Apple-touch-icon.png', 'Icon-192.png']) {
      await cp(join(repository, file), join(dist, file));
    }
    await cp(join(repository, 'resource'), join(dist, 'resource'), { recursive: true });
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${SITEMAP_NAMESPACE}"><url><loc>${baseUrl.href}</loc></url><url><loc>${new URL('servicios.html', baseUrl).href}</loc></url></urlset>`;
    await writeFile(join(dist, 'sitemap.xml'), sitemap);
    const robotsFile = join(dist, 'robots.txt');
    const validator = join(scripts, 'validate-dist.mjs');
    const runValidator = () => spawnSync(process.execPath, [validator], { cwd: root, encoding: 'utf8' });

    await writeFile(robotsFile, 'User-agent: *\nAllow: /\n\nUser-agent: ExampleBot\nDisallow: /ForgeLock/\n');
    const blocked = runValidator();
    assert.equal(blocked.status, 1);
    assert.match(blocked.stderr, /agente validado "examplebot"/);

    await writeFile(robotsFile, 'User-agent: *\nAllow: /\n\nUser-agent: Googlebot\nAllow: /ForgeLock/\n\nUser-agent: ExampleBot\nAllow: /ForgeLock/\nSitemap: https://forgelock-solution.github.io/ForgeLock/sitemap.xml\n');
    const allowed = runValidator();
    assert.equal(allowed.status, 0, allowed.stderr || allowed.stdout);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('rechaza XML mal formado y orden o cantidad inválidos en elementos url', () => {
  assert.throws(() => parseXmlDocument('<urlset><url></urlset>'), /XML mal formado/);
  const document = parseSitemap('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.test/</loc></url></urlset>');
  const makeChildren = (xml) => {
    const entry = parseXmlDocument(`<url xmlns="${SITEMAP_NAMESPACE}">${xml}</url>`).documentElement;
    return entry.children;
  };
  assert.equal(validateSitemapUrlChildren(makeChildren('<loc>https://example.test/</loc>')), true);
  assert.equal(validateSitemapUrlChildren(makeChildren('<loc>https://example.test/</loc><lastmod>2026-10-27</lastmod>')), true);
  assert.equal(validateSitemapUrlChildren(makeChildren('<lastmod>2026-10-27</lastmod><loc>https://example.test/</loc>')), false);
  assert.equal(validateSitemapUrlChildren(makeChildren('<loc>https://example.test/</loc><loc>https://example.test/a</loc>')), false);
  assert.equal(validateSitemapUrlChildren(makeChildren('<loc>https://example.test/</loc><lastmod>2026-10-27</lastmod><lastmod>2026-10-28</lastmod>')), false);
  assert.equal(document.documentElement.namespaceURI, SITEMAP_NAMESPACE);
});
