import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  discoverArtifactFiles,
  discoverPublicHtmlFiles,
  getCanonicalUrls,
  getSitemapRobotsBlockers,
  isNoindex,
  parseHtml,
  parseSitemapLocations,
  SITE_URL
} from './seo-helpers.mjs';

const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = resolve(dirname(scriptPath), '..');
const defaultBaseUrl = new URL(SITE_URL);

function mimeType(response) {
  return response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() || '';
}

function sitemapDirectiveValues(robots) {
  return robots.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^sitemap\s*:/i.test(line))
    .map((line) => line.replace(/^sitemap\s*:\s*/i, ''));
}

async function request(url, label, expectedMime, fetchImpl, failures, {
  allow404 = false,
  userAgent = 'ForgeLock-SEO-Audit/1.0'
} = {}) {
  let response;
  try {
    response = await fetchImpl(url, {
      redirect: 'manual',
      headers: { 'user-agent': userAgent },
      signal: AbortSignal.timeout(15000)
    });
  } catch (error) {
    failures.push(`${label}: no se pudo consultar ${url.href}: ${error.message}`);
    return null;
  }

  if (allow404 && response.status === 404) return response;
  if (response.status !== 200) {
    failures.push(`${label}: HTTP ${response.status} en ${url.href}; no se siguieron redirecciones.`);
    return null;
  }
  if (expectedMime && mimeType(response) !== expectedMime) {
    failures.push(`${label}: Content-Type ${response.headers.get('content-type') || '(ausente)'}; se esperaba ${expectedMime}.`);
    return null;
  }
  return response;
}

function localRefreshTarget(html, bridgeUrl) {
  const document = parseHtml(html);
  const refresh = document.querySelector('meta[http-equiv]');
  if (refresh?.getAttribute('http-equiv')?.toLowerCase() !== 'refresh') return null;
  const destination = refresh.getAttribute('content')?.match(/;\s*url\s*=\s*['"]?([^'"]+)['"]?\s*$/i)?.[1];
  return destination ? new URL(destination, bridgeUrl).href : null;
}

export async function auditPublicSeo({
  dist = resolve(projectRoot, 'dist'),
  baseUrl = defaultBaseUrl,
  fetchImpl = fetch
} = {}) {
  const projectBaseUrl = new URL(baseUrl);
  const sitemapUrl = new URL('sitemap.xml', projectBaseUrl);
  const projectRobotsUrl = new URL('robots.txt', projectBaseUrl);
  const originRobotsUrl = new URL('/robots.txt', projectBaseUrl.origin);
  const failures = [];
  const warnings = [];
  const checkedPages = [];
  const distSitemapPath = resolve(dist, 'sitemap.xml');
  if (!existsSync(distSitemapPath)) {
    throw new Error(`No existe ${distSitemapPath}. Ejecuta npm run build:dist antes de la auditoría pública.`);
  }

  const localXml = await readFile(distSitemapPath, 'utf8');
  const localSitemap = parseSitemapLocations(localXml, projectBaseUrl);
  if (!localSitemap.locations.length) failures.push('El sitemap local no contiene URLs indexables.');
  const localRobotsPaths = new Set([
    ...localSitemap.locations.map((location) => new URL(location).pathname),
    ...(await discoverArtifactFiles(dist)).map((file) => new URL(file, projectBaseUrl).pathname)
  ]);

  const rootRobotsResponse = await request(originRobotsUrl, 'robots del origen', null, fetchImpl, failures, { allow404: true });
  if (rootRobotsResponse?.status === 404) {
    warnings.push(`${originRobotsUrl.href} no está publicado por este sitio de proyecto; el robots.txt de /ForgeLock/ no controla la raíz del origen.`);
  } else if (rootRobotsResponse?.status === 200) {
    if (mimeType(rootRobotsResponse) !== 'text/plain') {
      failures.push(`robots del origen: Content-Type ${rootRobotsResponse.headers.get('content-type') || '(ausente)'}; se esperaba text/plain.`);
    } else {
      const rootRobots = await rootRobotsResponse.text();
      const blockers = [...localRobotsPaths].flatMap((path) =>
        getSitemapRobotsBlockers(rootRobots, path).map((agent) => `${path} (${agent})`)
      );
      if (blockers.length) failures.push(`robots del origen bloquea páginas o archivos del proyecto: ${blockers.join(', ')}.`);
      const directives = sitemapDirectiveValues(rootRobots);
      if (!directives.includes(sitemapUrl.href)) {
        warnings.push(`robots del origen no anuncia ${sitemapUrl.href}.`);
      }
    }
  }

  const projectRobotsResponse = await request(projectRobotsUrl, 'robots del proyecto', 'text/plain', fetchImpl, failures);
  if (projectRobotsResponse) {
    const projectRobots = await projectRobotsResponse.text();
    const directives = sitemapDirectiveValues(projectRobots);
    if (directives.length !== 1 || directives[0] !== sitemapUrl.href) {
      failures.push(`robots del proyecto debe anunciar exactamente ${sitemapUrl.href}.`);
    }
    const blockers = [...localRobotsPaths].flatMap((path) =>
      getSitemapRobotsBlockers(projectRobots, path).map((agent) => `${path} (${agent})`)
    );
    if (blockers.length) failures.push(`robots del proyecto bloquea páginas o archivos publicados: ${blockers.join(', ')}.`);
  }

  const sitemapResponse = await request(sitemapUrl, 'sitemap público', null, fetchImpl, failures);
  let publishedLocations = [];
  if (sitemapResponse) {
    if (!['application/xml', 'text/xml'].includes(mimeType(sitemapResponse))) {
      failures.push(`sitemap público: Content-Type ${sitemapResponse.headers.get('content-type') || '(ausente)'}; se esperaba XML.`);
    } else {
      try {
        const publishedSitemap = parseSitemapLocations(await sitemapResponse.text(), projectBaseUrl);
        publishedLocations = publishedSitemap.locations;
        const missing = localSitemap.locations.filter((location) => !publishedLocations.includes(location));
        const unexpected = publishedLocations.filter((location) => !localSitemap.locations.includes(location));
        if (missing.length || unexpected.length) {
          failures.push(`El sitemap publicado no coincide con dist/. Faltan: ${missing.join(', ') || 'ninguna'}; sobran: ${unexpected.join(', ') || 'ninguna'}.`);
        }
      } catch (error) {
        failures.push(`sitemap público inválido: ${error.message}`);
      }
    }
  }

  let googlebotUserAgentProbePassed = false;
  const googlebotResponse = await request(
    sitemapUrl,
    'sitemap con User-Agent Googlebot simulado',
    null,
    fetchImpl,
    failures,
    { userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }
  );
  if (googlebotResponse) {
    if (!['application/xml', 'text/xml'].includes(mimeType(googlebotResponse))) {
      failures.push(`sitemap con User-Agent Googlebot: Content-Type ${googlebotResponse.headers.get('content-type') || '(ausente)'}; se esperaba XML.`);
    } else {
      try {
        const googlebotSitemap = parseSitemapLocations(await googlebotResponse.text(), projectBaseUrl);
        googlebotUserAgentProbePassed = publishedLocations.length === googlebotSitemap.locations.length &&
          publishedLocations.every((location) => googlebotSitemap.locations.includes(location));
        if (!googlebotUserAgentProbePassed) failures.push('El sitemap difiere con el User-Agent Googlebot simulado.');
      } catch (error) {
        failures.push(`sitemap con User-Agent Googlebot inválido: ${error.message}`);
      }
    }
  }

  for (const location of publishedLocations) {
    const url = new URL(location);
    const response = await request(url, 'página del sitemap', 'text/html', fetchImpl, failures);
    if (!response) continue;

    const html = await response.text();
    const canonicals = getCanonicalUrls(html);
    if (canonicals.length !== 1 || canonicals[0] !== location) {
      failures.push(`Canonical pública incorrecta en ${location}: ${canonicals.join(', ') || '(ausente)'}.`);
    }
    if (isNoindex(html)) failures.push(`La URL indexable del sitemap tiene noindex: ${location}.`);
    checkedPages.push(location);
  }

  const htmlFiles = await discoverPublicHtmlFiles(dist);
  const bridges = [];
  for (const file of htmlFiles) {
    const html = await readFile(resolve(dist, file), 'utf8');
    if (!/<meta\b[^>]*http-equiv=["']refresh["']/i.test(html)) continue;
    const canonical = getCanonicalUrls(html)[0];
    if (!canonical || !localSitemap.locations.includes(canonical)) {
      failures.push(`El puente local ${file} no apunta a una URL indexable del sitemap.`);
      continue;
    }
    bridges.push({ file, canonical });
  }

  let checkedBridges = 0;
  for (const bridge of bridges) {
    const bridgeUrl = new URL(bridge.file, projectBaseUrl);
    const response = await request(bridgeUrl, 'puente .html', 'text/html', fetchImpl, failures);
    if (!response) continue;

    const html = await response.text();
    checkedBridges += 1;
    const canonicals = getCanonicalUrls(html);
    if (canonicals.length !== 1 || canonicals[0] !== bridge.canonical) {
      failures.push(`Canonical incorrecta en el puente público ${bridgeUrl.href}.`);
    }
    if (!isNoindex(html)) failures.push(`El puente público debe ser noindex: ${bridgeUrl.href}.`);
    const refreshTarget = localRefreshTarget(html, bridgeUrl);
    if (refreshTarget !== bridge.canonical) {
      failures.push(`La actualización inmediata del puente no apunta a ${bridge.canonical}: ${bridgeUrl.href}.`);
    }

    const document = parseHtml(html);
    const visibleLink = [...document.querySelectorAll('main a[href]')].some((anchor) => {
      try {
        return new URL(anchor.getAttribute('href'), bridgeUrl).href === bridge.canonical;
      } catch {
        return false;
      }
    });
    if (!visibleLink) failures.push(`El puente público no incluye un enlace visible a ${bridge.canonical}.`);
  }

  return { failures, warnings, checkedPages, checkedBridges, googlebotUserAgentProbePassed };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(scriptPath)) {
  const result = await auditPublicSeo();
  console.log(`Auditoría pública SEO: ${result.checkedPages.length} páginas indexables y ${result.checkedBridges} puentes revisados.`);
  console.log(`Prueba de User-Agent Googlebot simulado: ${result.googlebotUserAgentProbePassed ? 'HTTP/XML correcto' : 'sin confirmación'}; no demuestra rastreo desde infraestructura de Google.`);
  for (const warning of result.warnings) console.warn(`ADVERTENCIA: ${warning}`);
  if (result.failures.length) {
    for (const failure of result.failures) console.error(`ERROR: ${failure}`);
    process.exitCode = 1;
  } else {
    console.log('Sitemap, páginas y puentes públicos coinciden con el artefacto local.');
  }
}
