// Genera robots.txt y sitemap.xml en el artefacto estático de ForgeLock.
import { existsSync } from 'node:fs';
import { readFile, readdir, writeFile } from 'node:fs/promises';
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
  LEGACY_GITHUB_PAGES_BASE,
  normalizeBaseUrl,
  SEO_TARGETS,
  setNoindex,
  SITEMAP_NAMESPACE
} from './seo-helpers.mjs';

const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = join(dirname(scriptPath), '..');

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

function rewriteJsonLdUrls(html, baseUrl, canonicalBaseUrl) {
  return html.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (_whole, open, source, close) => {
    const data = JSON.parse(source);
    const rewrite = (value) => {
      if (Array.isArray(value)) return value.map(rewrite);
      if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, rewrite(entry)]));
      }
      if (typeof value !== 'string' || !value.startsWith(baseUrl.href)) return value;
      const suffix = value.slice(baseUrl.href.length);
      const page = suffix.match(/^([a-z0-9-]+)\.html([?#].*)?$/i);
      if (suffix && suffix !== 'index.html' && !page && !suffix.startsWith('#') && !suffix.startsWith('?')) return value;
      const route = page && page[1].toLowerCase() !== 'index' ? page[1] : '';
      const fragmentOrQuery = suffix.match(/([?#].*)$/)?.[1] || '';
      return `${new URL(route, canonicalBaseUrl).href}${fragmentOrQuery}`;
    };
    return `${open}\n${JSON.stringify(rewrite(data), null, 2)}\n${close}`;
  });
}

function rewriteTransitionSignals(html, file, baseUrl, canonicalBaseUrl, canonicalTarget) {
  const canonicalUrl = getPageUrl(file, canonicalBaseUrl, canonicalTarget);
  html = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/\brel=["'][^"']*\b(?:canonical|alternate)\b[^"']*["']/i.test(tag)) return tag;
    return tag.replace(/\bhref=(["'])[^"']*\1/i, `href="${canonicalUrl}"`);
  });
  html = html.replace(/<meta\b[^>]*>/gi, (tag) => {
    if (!/\bproperty=["']og:url["']/i.test(tag)) return tag;
    return tag.replace(/\bcontent=(["'])[^"']*\1/i, `content="${canonicalUrl}"`);
  });
  return rewriteJsonLdUrls(html, baseUrl, canonicalBaseUrl);
}

export async function generateSeo({
  root = projectRoot,
  dist = getDistDirectory(root),
  baseUrl: baseUrlValue,
  indexable = process.env.INDEXABLE !== 'false',
  getLastModified = (pagePath) => lastModifiedFromGit(root, pagePath),
  env = process.env
} = {}) {
  const config = getSeoConfig(env);
  const target = config.target;
  const transition = config.transition;
  const baseUrl = normalizeBaseUrl(baseUrlValue || config.baseUrl.href || DEFAULT_BASE_URL);
  const canonicalBaseUrl = transition ? new URL(SEO_TARGETS.cloudflare) : baseUrl;
  const canonicalTarget = transition ? 'cloudflare' : target;
  if (!existsSync(dist)) throw new Error('No existe dist/. Ejecuta scripts/create-dist.mjs primero.');

  const htmlFiles = (await discoverPublicHtmlFiles(dist))
    .sort((left, right) => left === right ? 0 : left === 'index.html' ? -1 : right === 'index.html' ? 1 : left.localeCompare(right));
  if (indexable && !transition && htmlFiles.length === 0) {
    throw new Error('No se encontraron páginas HTML en dist/ para generar el sitemap.');
  }

  for (const file of htmlFiles) {
    const path = join(dist, file);
    let html = await readFile(path, 'utf8');
    if (LEGACY_GITHUB_PAGES_BASE !== baseUrl.href && html.includes(LEGACY_GITHUB_PAGES_BASE)) {
      html = html.replaceAll(LEGACY_GITHUB_PAGES_BASE, baseUrl.href);
    }

    if (target === 'cloudflare') {
      const sourcePageUrl = new URL(file, baseUrl).href;
      const finalPageUrl = getPageUrl(file, baseUrl, target);
      if (sourcePageUrl !== finalPageUrl) html = html.replaceAll(sourcePageUrl, finalPageUrl);
      html = html.replace(/href="\.\/index\.html(?=[#"?])/g, 'href="./');
      html = html.replace(/href="\.\/([a-z0-9-]+)\.html(?=[#"?])/gi, 'href="./$1');
    }
    if (transition) html = rewriteTransitionSignals(html, file, baseUrl, canonicalBaseUrl, canonicalTarget);
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
  if (indexable && !transition) {
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
  const sitemapBaseUrl = transition ? canonicalBaseUrl : baseUrl;
  const robots = `User-agent: *\nAllow: /\n${indexable ? `\nSitemap: ${new URL('sitemap.xml', sitemapBaseUrl).href}\n` : ''}`;

  await writeFile(join(dist, 'sitemap.xml'), sitemap, 'utf8');
  await writeFile(join(dist, 'robots.txt'), robots, 'utf8');
  console.log(`SEO generado: destino=${target}; ${entries.length} URLs indexables; indexable=${indexable}; BASE_URL=${baseUrl.href}`);
  return { sitemap, robots, pageCount: entries.length, baseUrl: baseUrl.href };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(scriptPath)) {
  await generateSeo();
}
