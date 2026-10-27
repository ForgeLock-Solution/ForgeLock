// Genera robots.txt y sitemap.xml en el artefacto estático de ForgeLock.
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_BASE_URL,
  discoverPublicHtmlFiles,
  SITEMAP_NAMESPACE,
  escapeXml,
  getCanonicalUrls,
  isNoindex,
  isValidLastmod,
  normalizeBaseUrl,
  setNoindex
} from './seo-helpers.mjs';

const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = join(dirname(scriptPath), '..');
const legacyBaseUrl = DEFAULT_BASE_URL;

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

function routeForHtmlFile(file) {
  return file === 'index.html' ? '' : file;
}

export async function generateSeo({
  root = projectRoot,
  dist = join(root, 'dist'),
  baseUrl: baseUrlValue = process.env.BASE_URL || DEFAULT_BASE_URL,
  indexable = process.env.INDEXABLE !== 'false',
  getLastModified = (pagePath) => lastModifiedFromGit(root, pagePath)
} = {}) {
  const baseUrl = normalizeBaseUrl(baseUrlValue);
  if (!existsSync(dist)) throw new Error('No existe dist/. Ejecuta scripts/create-dist.mjs primero.');

  const htmlFiles = (await discoverPublicHtmlFiles(dist))
    .sort((left, right) => left === right ? 0 : left === 'index.html' ? -1 : right === 'index.html' ? 1 : left.localeCompare(right));

  if (indexable && htmlFiles.length === 0) {
    throw new Error('No se encontraron páginas HTML en dist/ para generar el sitemap.');
  }

  // Reescribe solo el host/ruta base histórica dentro del artefacto, nunca en los fuentes.
  for (const file of htmlFiles) {
    const path = join(dist, file);
    let html = await readFile(path, 'utf8');
    if (html.includes(legacyBaseUrl)) html = html.replaceAll(legacyBaseUrl, baseUrl.href);
    if (!indexable) html = setNoindex(html);
    await writeFile(path, html, 'utf8');
  }

  const entries = [];
  const canonicalOwners = new Map();
  if (indexable) {
    for (const file of htmlFiles) {
      const path = join(dist, file);
      const html = await readFile(path, 'utf8');
      if (isNoindex(html)) continue;

      const route = routeForHtmlFile(file);
      const expectedUrl = new URL(route, baseUrl).href;
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
    if (entries.length === 0) {
      throw new Error('No se encontraron páginas públicas con canonical propia para el sitemap.');
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${SITEMAP_NAMESPACE}">\n${entries.join('\n')}\n</urlset>\n`;
  const sitemapUrl = new URL('sitemap.xml', baseUrl).href;
  const robots = `User-agent: *\nAllow: /\n${indexable ? `\nSitemap: ${sitemapUrl}\n` : ''}`;

  await writeFile(join(dist, 'sitemap.xml'), sitemap, 'utf8');
  await writeFile(join(dist, 'robots.txt'), robots, 'utf8');
  console.log(`SEO generado: ${entries.length} URLs indexables; indexable=${indexable}; BASE_URL=${baseUrl.href}`);
  return { sitemap, robots, pageCount: entries.length, baseUrl: baseUrl.href };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(scriptPath)) {
  await generateSeo();
}
