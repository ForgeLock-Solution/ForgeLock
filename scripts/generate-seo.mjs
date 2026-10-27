// Genera robots.txt y sitemap.xml para el sitio estático de ForgeLock.
import { existsSync } from 'node:fs';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const legacyBaseUrl = 'https://forgelock-solution.github.io/ForgeLock/';
const configuredBaseUrl = process.env.BASE_URL || legacyBaseUrl;
const parsedBaseUrl = new URL(configuredBaseUrl);
if (!['http:', 'https:'].includes(parsedBaseUrl.protocol) || parsedBaseUrl.search || parsedBaseUrl.hash) {
  throw new Error('BASE_URL debe ser una URL HTTP(S) absoluta sin query ni fragmento.');
}
parsedBaseUrl.pathname = `${parsedBaseUrl.pathname.replace(/\/+$/, '')}/`;
const baseUrl = parsedBaseUrl.href;
const indexable = process.env.INDEXABLE !== 'false';
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
  const loc = file === 'index.html' ? baseUrl : new URL(file, baseUrl).href;
  const date = lastModified(file);
  urls.push(`  <url>\n    <loc>${loc}</loc>${date ? `\n    <lastmod>${date}</lastmod>` : ''}\n  </url>`);
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
const robots = `User-agent: *\nAllow: /\n${indexable ? `\nSitemap: ${new URL('sitemap.xml', baseUrl).href}\n` : ''}`;
if (!existsSync(dist)) throw new Error('No existe dist/. Ejecuta scripts/create-dist.mjs primero.');

// Los metadatos SEO se concretan en el artefacto para que la URL base sea
// configurable sin reescribir los archivos fuente durante cada compilación.
for (const file of (await readdir(dist)).filter((entry) => entry.endsWith('.html'))) {
  const path = join(dist, file);
  let html = await readFile(path, 'utf8');
  if (html.includes(legacyBaseUrl)) html = html.replaceAll(legacyBaseUrl, baseUrl);
  if (!indexable && !/<meta\s+name=["']robots["'][^>]*noindex/i.test(html)) {
    html = html.replace(/<head\b[^>]*>/i, (head) => `${head}\n    <meta name="robots" content="noindex,follow">`);
  }
  await writeFile(path, html);
}
await writeFile(join(dist, 'sitemap.xml'), sitemap);
await writeFile(join(dist, 'robots.txt'), robots);
console.log(`SEO generado: ${urls.length} URLs indexables; indexable=${indexable}; BASE_URL=${baseUrl}`);
