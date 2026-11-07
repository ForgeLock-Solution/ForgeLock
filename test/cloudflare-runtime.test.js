import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { JSDOM } from 'jsdom';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const wranglerCli = process.env.FORGELOCK_WRANGLER_CLI || resolve(root, 'node_modules/wrangler/bin/wrangler.js');
const tempRoot = await mkdtemp(join(tmpdir(), 'forgelock-worker-runtime-'));
const wranglerSupported = Number(process.versions.node.split('.')[0]) >= 22;
let previewProcess;
after(async () => {
  if (previewProcess?.exitCode === null) {
    await new Promise((resolvePromise, reject) => {
      const timer = setTimeout(() => reject(new Error('Wrangler preview no terminó tras solicitar su cierre.')), 5000);
      previewProcess.once('exit', () => {
        clearTimeout(timer);
        resolvePromise();
      });
      previewProcess.kill('SIGTERM');
    });
  }
  for (let attempt = 0; ; attempt += 1) {
    try {
      await rm(tempRoot, { recursive: true, force: true });
      break;
    } catch (error) {
      if (!['EBUSY', 'EPERM'].includes(error.code) || attempt === 49) throw error;
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
    }
  }
});

async function freePort() {
  const server = createServer();
  await new Promise((resolvePromise, reject) => server.listen(0, '127.0.0.1', resolvePromise).once('error', reject));
  const address = server.address();
  await new Promise((resolvePromise, reject) => server.close((error) => error ? reject(error) : resolvePromise()));
  return address.port;
}

test('Workers Static Assets sirve las rutas SEO locales con señales coherentes', {
  skip: !existsSync(wranglerCli)
    ? 'Wrangler no está instalado localmente; se requiere preview real para probar el runtime.'
    : !wranglerSupported
      ? 'Wrangler 4.155.0 requiere Node.js 22 o superior para probar el runtime.'
      : false
}, async () => {
  const assetsDir = join(tempRoot, 'assets');
  const configPath = join(tempRoot, 'wrangler.toml');
  const npmInvocation = process.env.npm_execpath;
  const build = spawnSync(npmInvocation ? process.execPath : 'npm', npmInvocation ? [npmInvocation, 'run', 'build:dist:cloudflare'] : ['run', 'build:dist:cloudflare'], {
    cwd: root,
    encoding: 'utf8',
    shell: !npmInvocation && process.platform === 'win32',
    env: { ...process.env, SEO_TARGET: 'cloudflare', DIST_DIR: assetsDir }
  });
  assert.equal(build.status, 0, `${build.stdout}\n${build.stderr}`);
  const projectConfig = await readFile(join(root, 'wrangler.toml'), 'utf8');
  assert.match(projectConfig, /^name\s*=\s*"forgelock"\s*$/m);
  assert.match(projectConfig, /^directory\s*=\s*"\.\/dist-cloudflare"\s*$/m);
  const previewConfig = projectConfig
    .replace(/^name\s*=\s*"forgelock"\s*$/m, 'name = "forgelock-seo-runtime-preview"')
    .replace(/^directory\s*=\s*"\.\/dist-cloudflare"\s*$/m, 'directory = "./assets"')
    .replace(/^main\s*=\s*"src\/platform\/cloudflare-worker\.js"\s*$/m, `main = "${join(root, 'src/platform/cloudflare-worker.js').replaceAll('\\', '/')}"`);
  assert.notEqual(previewConfig, projectConfig, 'el preview debe aislar la salida y cargar el Worker local');
  await writeFile(configPath, previewConfig);

  const port = await freePort();
  const preview = spawn(process.execPath, [wranglerCli, 'dev', '--local', '--config', configPath, '--ip', '127.0.0.1', '--port', String(port)], {
    cwd: tempRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, WRANGLER_SEND_METRICS: 'false' }
  });
  previewProcess = preview;
  let logs = '';
  preview.stdout.setEncoding('utf8').on('data', (chunk) => { logs += chunk; });
  preview.stderr.setEncoding('utf8').on('data', (chunk) => { logs += chunk; });
  const origin = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 30000;
  let ready = false;
  while (Date.now() < deadline && preview.exitCode === null) {
    try {
      const response = await fetch(`${origin}/`);
      if (response.status === 200) { ready = true; break; }
    } catch { /* Wrangler is still starting. */ }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 200));
  }
  assert.ok(ready, `Wrangler preview no inició.\n${logs}`);

  const seoBase = 'https://forgelock-solution.github.io/ForgeLock/';
  const serviceSlugs = [
    'branding-diseno-digital', 'integraciones', 'catalogos-digitales', 'landing-pages',
    'soluciones-personalizadas', 'sistemas-empresariales', 'automatizacion-whatsapp',
    'automatizacion-procesos'
  ];
  const finalRoutes = ['/', '/servicios/', ...serviceSlugs.map((slug) => `/servicios/${slug}/`)];
  let homeDocument;
  let servicesDocument;
  const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
  assert.equal(sitemapResponse.status, 200);
  const sitemap = new JSDOM(await sitemapResponse.text(), { contentType: 'application/xml' }).window.document;
  const sitemapUrls = [...sitemap.getElementsByTagNameNS('*', 'loc')].map((node) => node.textContent.trim());
  assert.deepEqual(sitemapUrls, []);
  const robotsResponse = await fetch(`${origin}/robots.txt`);
  assert.equal(robotsResponse.status, 200);
  assert.doesNotMatch(await robotsResponse.text(), /^Sitemap:/im);

  for (const route of finalRoutes) {
    const finalResponse = await fetch(`${origin}${route}`, { redirect: 'follow' });
    assert.equal(finalResponse.status, 200, `${route} respuesta final`);
    const body = await finalResponse.text();
    const document = new JSDOM(body, { url: finalResponse.url }).window.document;
    const expectedCanonical = new URL(route === '/' ? './' : route.slice(1), seoBase).href;
    assert.equal(document.querySelector('link[rel="canonical"]')?.href, expectedCanonical, `${route} canonical`);
    assert.equal(document.querySelector('meta[property="og:url"]')?.content, expectedCanonical, `${route} og:url`);
    assert.match(body, /<meta\s+name=["']robots["'][^>]*\bnoindex/i);
    if (route === '/') homeDocument = document;
    if (route === '/servicios/') servicesDocument = document;
    const structuredData = [...document.querySelectorAll('script[type="application/ld+json"]')].map((node) => JSON.parse(node.textContent));
    assert.ok(structuredData.length > 0);
    assert.ok(JSON.stringify(structuredData).includes(seoBase));
  }

  for (const slug of serviceSlugs) {
    const legacy = await fetch(`${origin}/servicio-${slug}.html`, { redirect: 'follow' });
    assert.equal(legacy.status, 200, `servicio-${slug}.html`);
    const document = new JSDOM(await legacy.text(), { url: legacy.url }).window.document;
    assert.equal(document.querySelector('link[rel="canonical"]')?.href, `${seoBase}servicios/${slug}/`);
    assert.match(document.querySelector('meta[name="robots"]')?.content ?? '', /noindex/);
    const visibleDestination = document.querySelector('main a')?.href;
    assert.ok(visibleDestination, `servicio-${slug}.html debe conservar un enlace visible`);
    assert.equal((await fetch(visibleDestination)).status, 200);
  }
  assert.equal((await fetch(`${origin}/servicio-desarrollo-web.html`)).status, 404);

  const legacyServiceResponse = await fetch(`${origin}/servicios?servicio=automatizacion-whatsapp`, { redirect: 'manual' });
  assert.equal(legacyServiceResponse.status, 302);
  assert.equal(new URL(legacyServiceResponse.headers.get('location')).pathname, '/servicios/automatizacion-whatsapp/');
  const legacyServicePage = await fetch(new URL(legacyServiceResponse.headers.get('location'), `${origin}/`));
  assert.equal(legacyServicePage.status, 200);
  assert.match(await legacyServicePage.text(), /Automatización de WhatsApp/);

  const previewResponse = await fetch(`${origin}/ejemplos/cafe-aurora.html`, { redirect: 'manual' });
  assert.equal(previewResponse.status, 307, 'la vista previa HTML debe redirigir a la ruta Worker sin extensión');
  const previewLocation = previewResponse.headers.get('location');
  const previewPage = await fetch(new URL(previewLocation, `${origin}/`));
  assert.equal(previewPage.status, 200);
  const previewDocument = new JSDOM(await previewPage.text(), { url: previewPage.url }).window.document;
  assert.equal(previewDocument.querySelector('meta[name="robots"]').content, 'noindex,follow');
  assert.equal(previewDocument.querySelector('link[rel="canonical"]').href, `${seoBase}ejemplos/cafe-aurora.html`);

  const missing = await fetch(`${origin}/carpeta/pagina-inexistente`);
  assert.equal(missing.status, 404);
  const errorDocument = new JSDOM(await missing.text(), { url: missing.url }).window.document;
  assert.equal(errorDocument.querySelector('h1').textContent, 'Esta página no existe');
  assert.equal(errorDocument.querySelector('base').getAttribute('href'), '/');
  assert.equal(errorDocument.querySelector('a').href, `${origin}/`);
  assert.match(errorDocument.querySelector('meta[name="robots"]').content, /noindex/);
  assert.equal((await fetch(errorDocument.querySelector('script[src]').src)).status, 200);

  for (const asset of ['resource/forgelock-social-preview.png', 'resource/Logo.png', 'src/styles/tailwind.css']) {
    assert.equal((await fetch(`${origin}/${asset}`)).status, 200, `${asset} debe servirse`);
  }

  for (const [document, pageUrl] of [[homeDocument, `${origin}/`], [servicesDocument, `${origin}/servicios/`]]) {
    for (const anchor of document.querySelectorAll('a[href]')) {
      const targetUrl = new URL(anchor.getAttribute('href'), pageUrl);
      if (targetUrl.origin !== origin) continue;
      const response = await fetch(targetUrl);
      assert.ok(response.ok, `${anchor.getAttribute('href')} debe seguir funcionando (${response.status})`);
      assert.equal(new URL(response.url).origin, origin, 'un enlace interno no debe salir del Worker');
    }
  }
});
