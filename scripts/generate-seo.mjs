// Genera robots.txt y sitemap.xml en el artefacto estático de ForgeLock.
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_BASE_URL,
  discoverPublicHtmlFiles,
  escapeXml,
  getCanonicalUrls,
  getDistDirectory,
  getPageUrl,
  getSeoConfig,
  isNoindex,
  isValidLastmod,
  normalizeBaseUrl,
  setNoindex,
  SITEMAP_NAMESPACE
} from './seo-helpers.mjs';

const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = join(dirname(scriptPath), '..');
function rewriteProductionUrls(html, target, baseUrl) {
  return html.replace(/https:\/\/(?:forgelock-solution\.github\.io\/ForgeLock\/|forgelock\.forge-look19\.workers\.dev\/)([^"'\s<>#]*)/g, (_match, rawPath) => {
    let route = rawPath;
    if (route === 'index.html') route = '';
    if (target === 'cloudflare' && route.endsWith('.html')) route = route.slice(0, -5);
    if (target === 'github-pages' && route && !/\.[a-z0-9]+$/i.test(route)) route = `${route}.html`;
    return new URL(route, baseUrl).href;
  });
}

function lastModifiedFromGit(root, pagePath) {
  try {
    const value = execFileSync('git', ['log', '-1', '--format=%cs', '--', pagePath], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    return isValidLastmod(value) ? value : '';
  } catch {
    return '';
  }
}

export async function generateSeo({
  root = projectRoot,
  dist = getDistDirectory(root),
  baseUrl: baseUrlValue,
  indexable: requestedIndexable,
  getLastModified = (pagePath) => lastModifiedFromGit(root, pagePath),
  env = process.env
} = {}) {
  const config = getSeoConfig(env);
  const target = config.target;
  if (target === 'cloudflare' && requestedIndexable === true) {
    throw new Error('Cloudflare se mantiene noindex con sitemap vacío; no se puede solicitar indexación.');
  }
  const indexable = target === 'cloudflare' ? false : (requestedIndexable ?? config.indexable);
  const baseUrl = normalizeBaseUrl(baseUrlValue || config.baseUrl.href || DEFAULT_BASE_URL);
  if (baseUrl.href !== config.baseUrl.href) throw new Error('baseUrl no coincide con el destino SEO configurado.');
  const { canonicalBaseUrl, canonicalTarget } = config;
  if (!existsSync(dist)) throw new Error('No existe dist/. Ejecuta scripts/create-dist.mjs primero.');

  const htmlFiles = (await discoverPublicHtmlFiles(dist))
    .sort((left, right) => left === right ? 0 : left === 'index.html' ? -1 : right === 'index.html' ? 1 : left.localeCompare(right));
  if (indexable && htmlFiles.length === 0) {
    throw new Error('No se encontraron páginas HTML en dist/ para generar el sitemap.');
  }

  for (const file of htmlFiles) {
    const path = join(dist, file);
    let html = await readFile(path, 'utf8');
    if (file === '404.html') {
      // El servidor conserva la URL solicitada, que puede tener carpetas anidadas.
      html = html.replace(/<base\b[^>]*>/gi, '');
      html = html.replace(/<head>/i, `<head>\n    <base href="${baseUrl.pathname}">`);
    }
    if (target === 'cloudflare') {
      // Adapt local navigation; preserve canonical, social metadata and JSON-LD.
      html = html.replace(/href="\.\/index\.html(?=[#"?])/g, 'href="./');
      html = html.replace(/href="\.\/([a-z0-9-]+)\.html(?=[#"?])/gi, 'href="./$1');
    }
    html = rewriteProductionUrls(html, target, canonicalBaseUrl);
    if (!indexable) html = setNoindex(html);
    await writeFile(path, html, 'utf8');
  }

  if (target === 'cloudflare') {
    const appViewPath = join(dist, 'src', 'views', 'app-view.js');
    if (existsSync(appViewPath)) {
      const appView = await readFile(appViewPath, 'utf8');
      await writeFile(appViewPath, appView.replace(/href="\.\/([a-z0-9-]+)\.html(?=[#"?])/gi, 'href="./$1'));
    }
  }

  const entries = [];
  const canonicalOwners = new Map();
  if (indexable) {
    for (const file of htmlFiles) {
      const html = await readFile(join(dist, file), 'utf8');
      if (isNoindex(html)) continue;

      const expectedUrl = getPageUrl(file, canonicalBaseUrl, canonicalTarget);
      const canonicals = getCanonicalUrls(html);
      if (canonicals.length !== 1 || canonicals[0] !== expectedUrl) {
        throw new Error(`dist/${file} debe tener una única canonical propia: ${expectedUrl}`);
      }
      if (canonicalOwners.has(expectedUrl)) {
        throw new Error(`Canonical duplicada en dist/${file} y dist/${canonicalOwners.get(expectedUrl)}: ${expectedUrl}`);
      }
      canonicalOwners.set(expectedUrl, file);

      const lastmodValue = getLastModified(file);
      const lastmod = isValidLastmod(lastmodValue) ? lastmodValue : '';
      entries.push(`  <url>\n    <loc>${escapeXml(expectedUrl)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`);
    }
    if (entries.length === 0) throw new Error('No se encontraron páginas públicas con canonical propia para el sitemap.');
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${SITEMAP_NAMESPACE}">\n${entries.join('\n')}\n</urlset>\n`;
  const robots = `User-agent: *\nAllow: /\n${indexable ? `\nSitemap: ${new URL('sitemap.xml', canonicalBaseUrl).href}\n` : ''}`;

  await writeFile(join(dist, 'sitemap.xml'), sitemap, 'utf8');
  await writeFile(join(dist, 'robots.txt'), robots, 'utf8');
  console.log(`SEO generado: destino=${target}; ${entries.length} URLs indexables; indexable=${indexable}; BASE_URL=${baseUrl.href}`);
  return { sitemap, robots, pageCount: entries.length, baseUrl: baseUrl.href };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(scriptPath)) {
  await generateSeo();
}
