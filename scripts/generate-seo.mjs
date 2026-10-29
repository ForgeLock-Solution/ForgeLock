// Genera robots.txt y sitemap.xml para el sitio estático de ForgeLock.
import { existsSync } from 'node:fs';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDistDirectory, getSeoConfig, getPageUrl, LEGACY_GITHUB_PAGES_BASE } from './seo-helpers.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = getDistDirectory(root);
const { target, transition, baseUrl, canonicalBaseUrl, canonicalTarget, indexable } = getSeoConfig();
const candidates = ['index.html', 'servicios.html'];

function lastModified(file) {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', file], {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return '';
  }
}

const urls = [];
for (const file of candidates) {
  const path = join(dist, file);
  if (!indexable || !existsSync(path)) continue;
  const html = await readFile(path, 'utf8');
  if (/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html)) continue;
  if (transition) continue;
  const loc = getPageUrl(file, canonicalBaseUrl, canonicalTarget);
  const date = lastModified(file);
  urls.push(`  <url>\n    <loc>${loc}</loc>${date ? `\n    <lastmod>${date}</lastmod>` : ''}\n  </url>`);
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
const robotsSitemap = transition ? new URL('sitemap.xml', canonicalBaseUrl).href : new URL('sitemap.xml', baseUrl).href;
const robots = `User-agent: *\nAllow: /\n${indexable ? `\nSitemap: ${robotsSitemap}\n` : ''}`;
if (!existsSync(dist)) throw new Error('No existe dist/. Ejecuta scripts/create-dist.mjs primero.');

// Los metadatos SEO se concretan en el artefacto para que la URL base sea
// configurable sin reescribir los archivos fuente durante cada compilación.
for (const file of (await readdir(dist)).filter((entry) => entry.endsWith('.html'))) {
  const path = join(dist, file);
  let html = await readFile(path, 'utf8');
  if (baseUrl.href !== LEGACY_GITHUB_PAGES_BASE && html.includes(LEGACY_GITHUB_PAGES_BASE)) {
    html = html.replaceAll(LEGACY_GITHUB_PAGES_BASE, baseUrl.href);
  }
  if (target === 'cloudflare') {
    const sourcePageUrl = new URL(file, baseUrl).href;
    const finalPageUrl = getPageUrl(file, baseUrl, target);
    if (sourcePageUrl !== finalPageUrl) html = html.replaceAll(sourcePageUrl, finalPageUrl);
    html = html.replace(/href="\.\/index\.html(?=[#"?])/g, 'href="./');
    html = html.replace(/href="\.\/([a-z0-9-]+)\.html(?=[#"?])/gi, 'href="./$1');
  }
  if (transition) {
    const canonicalUrl = getPageUrl(file, canonicalBaseUrl, canonicalTarget);
    html = html.replace(/<link\b[^>]*>/gi, (tag) => {
      if (!/\brel=["'][^"']*\b(?:canonical|alternate)\b[^"']*["']/i.test(tag)) return tag;
      return tag.replace(/\bhref=(["'])[^"']*\1/i, `href="${canonicalUrl}"`);
    });
    html = html.replace(/<meta\b[^>]*>/gi, (tag) => {
      if (!/\bproperty=["']og:url["']/i.test(tag)) return tag;
      return tag.replace(/\bcontent=(["'])[^"']*\1/i, `content="${canonicalUrl}"`);
    });
    html = html.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (_whole, open, source, close) => {
      const data = JSON.parse(source);
      const rewriteStructuredUrls = (value) => {
        if (Array.isArray(value)) return value.map(rewriteStructuredUrls);
        if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, rewriteStructuredUrls(entry)]));
        if (typeof value !== 'string' || !value.startsWith(baseUrl.href)) return value;
        const suffix = value.slice(baseUrl.href.length);
        const page = suffix.match(/^([a-z0-9-]+)\.html([?#].*)?$/i);
        if (suffix && suffix !== 'index.html' && !page) {
          if (!suffix.startsWith('#') && !suffix.startsWith('?')) return value;
        }
        const route = page && page[1].toLowerCase() !== 'index' ? page[1] : '';
        const suffixParts = suffix.match(/([?#].*)$/)?.[1] || '';
        return `${new URL(route, canonicalBaseUrl).href}${suffixParts}`;
      };
      return `${open}\n${JSON.stringify(rewriteStructuredUrls(data), null, 2)}\n${close}`;
    });
  }
  if (!indexable && !/<meta\s+name=["']robots["'][^>]*noindex/i.test(html)) {
    html = html.replace(/<head\b[^>]*>/i, (head) => `${head}\n    <meta name="robots" content="noindex,follow">`);
  }
  await writeFile(path, html);
}
if (target === 'cloudflare') {
  const appViewPath = join(dist, 'src', 'views', 'app-view.js');
  if (existsSync(appViewPath)) {
    const appView = await readFile(appViewPath, 'utf8');
    await writeFile(appViewPath, appView.replace(/href="\.\/([a-z0-9-]+)\.html(?=[#"?])/gi, 'href="./$1'));
  }
}
await writeFile(join(dist, 'sitemap.xml'), sitemap);
await writeFile(join(dist, 'robots.txt'), robots);
console.log(`SEO generado: destino=${target}; ${urls.length} URLs indexables; indexable=${indexable}; BASE_URL=${baseUrl.href}`);
